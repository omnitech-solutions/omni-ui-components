import { parsers } from 'prettier/plugins/typescript';

// Read the original TSX, rather than transformed function.toString() output.
// This preserves hooks, callback bodies, JSX children and named data fixtures.
type Node = {
  type: string;
  range: [number, number];
  name?: string;
  [key: string]: unknown;
};
type Module = {
  source: string;
  declarations: Map<string, Node>;
  imports: Map<string, { node: Node; specifier: Node; from: string }>;
};
const modules = new Map<string, Module>();

function walk(node: unknown, visit: (node: Node) => void) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    node.forEach((child) => walk(child, visit));
    return;
  }
  const value = node as Node;
  if (typeof value.type !== 'string') return;
  visit(value);
  for (const [key, child] of Object.entries(value)) {
    if (['loc', 'range', 'comments', 'tokens', 'parent'].includes(key)) continue;
    walk(child, visit);
  }
}

function read(source: string): Module {
  const cached = modules.get(source);
  if (cached) return cached;
  const ast = parsers.typescript.parse(source, { filepath: 'example.tsx' } as Parameters<typeof parsers.typescript.parse>[1]) as { body: Node[] };
  const module: Module = {
    source,
    declarations: new Map(),
    imports: new Map(),
  };
  for (let node of ast.body) {
    if (node.type === 'ImportDeclaration') {
      const from = (node.source as { value: string }).value;
      for (const specifier of node.specifiers as Node[]) {
        module.imports.set((specifier.local as Node).name!, {
          node,
          specifier,
          from,
        });
      }
      continue;
    }
    if (node.type === 'ExportNamedDeclaration') node = node.declaration as Node;
    if (!node) continue;
    if (node.type === 'VariableDeclaration') {
      for (const declaration of node.declarations as Node[]) module.declarations.set((declaration.id as Node).name!, declaration);
    } else if ((node.id as Node)?.name) module.declarations.set((node.id as Node).name!, node);
  }
  modules.set(source, module);
  return module;
}

/** Build an example from its actual preview, with transitive data/helper definitions. */
export function buildSourceSnippet(source: string, target: string, dependencies: Record<string, string> = {}): string {
  const root = read(source);
  const [name, property] = target.split('.');
  const declaration = root.declarations.get(name);
  if (!declaration) throw new Error(`Missing preview source: ${target}`);
  let expression = declaration.init as Node;
  if (property) {
    const entry = (expression.properties as Node[]).find((item) => (item.key as Node)?.name === property);
    if (!entry) throw new Error(`Missing preview source: ${target}`);
    expression = entry.value as Node;
  }
  const text = (module: Module, node: Node) => module.source.slice(...node.range);
  const lines: string[] = [];
  const imports = new Set<string>();
  const visited = new Set<string>();
  const collect = (module: Module, node: Node) => {
    // Local bindings must not accidentally pull same-named module fixtures.
    const bound = new Set<string>();
    const bind = (pattern: Node) => {
      if (!pattern) return;
      if (pattern.type === 'Identifier') bound.add(pattern.name!);
      else if (pattern.type === 'AssignmentPattern') bind(pattern.left as Node);
      else if (pattern.type === 'RestElement') bind(pattern.argument as Node);
      else if (pattern.type === 'ArrayPattern') (pattern.elements as Node[]).forEach(bind);
      else if (pattern.type === 'ObjectPattern')
        (pattern.properties as Node[]).forEach((property) => bind((property.value ?? property.argument) as Node));
    };
    walk(node, (child) => {
      if (child.type === 'VariableDeclarator') bind(child.id as Node);
      if (['ArrowFunctionExpression', 'FunctionExpression', 'FunctionDeclaration'].includes(child.type)) (child.params as Node[]).forEach(bind);
    });
    const references = new Set<string>();
    walk(node, (child) => {
      if (['Identifier', 'JSXIdentifier'].includes(child.type) && !bound.has(child.name!)) references.add(child.name!);
    });
    for (const reference of references) {
      if (visited.has(reference)) continue;
      const local = module.declarations.get(reference);
      const imported = module.imports.get(reference);
      if (!local && !imported) continue;
      visited.add(reference);
      if (local) {
        collect(module, local);
        lines.push(local.type === 'VariableDeclarator' ? `const ${text(module, local)};` : text(module, local));
      } else if (imported) {
        const dependency = dependencies[imported.from];
        const importedName = (imported.specifier.imported as Node)?.name ?? reference;
        if (dependency) {
          const dependencyModule = read(dependency);
          const definition = dependencyModule.declarations.get(importedName);
          if (!definition) throw new Error(`Missing fixture definition: ${importedName}`);
          collect(dependencyModule, definition);
          lines.push(definition.type === 'VariableDeclarator' ? `const ${text(dependencyModule, definition)};` : text(dependencyModule, definition));
          if (reference !== importedName) lines.push(`const ${reference} = ${importedName};`);
        } else {
          const from =
            imported.from === './index' ||
            (imported.from.startsWith('@oc-tech/omni-ui-components/') && imported.from !== '@oc-tech/omni-ui-components/dynamic-form')
              ? '@oc-tech/omni-ui-components'
              : imported.from;
          const specifier = text(module, imported.specifier);
          if (imported.specifier.type === 'ImportNamespaceSpecifier') imports.add(`import ${specifier} from '${from}';`);
          else if (imported.specifier.type === 'ImportDefaultSpecifier') imports.add(`import ${specifier} from '${from}';`);
          else imports.add(`import ${imported.node.importKind === 'type' ? 'type ' : ''}{ ${specifier} } from '${from}';`);
        }
      }
    }
  };
  visited.add(name);
  collect(root, expression);
  const body = text(root, expression);
  return [...imports, '', ...lines, '', `export const Example = ${body};`].join('\n');
}
