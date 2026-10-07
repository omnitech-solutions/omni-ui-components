import path from 'node:path';
import { describe, expect, it } from 'vitest';
import ts from 'typescript';

const entry = path.resolve(__dirname, '../src/index.ts');

function collectExportNames(): Map<string, string[]> {
  const configPath = ts.findConfigFile(path.dirname(entry), ts.sys.fileExists, 'tsconfig.json');
  const config = configPath ? ts.readConfigFile(configPath, ts.sys.readFile) : { config: {} };
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, configPath ? path.dirname(configPath) : path.dirname(entry));
  const program = ts.createProgram([entry], { ...parsed.options, noEmit: true });
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(entry)!;
  const names = new Map<string, string[]>();
  const add = (name: string, from: string) => names.set(name, [...(names.get(name) ?? []), from]);

  for (const stmt of source.statements) {
    if (ts.isExportDeclaration(stmt)) {
      const spec = stmt.moduleSpecifier ? (stmt.moduleSpecifier as ts.StringLiteral).text : '(local)';
      if (stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
        for (const el of stmt.exportClause.elements) add(el.name.text, spec);
      } else if (stmt.moduleSpecifier) {
        const symbol = checker.getSymbolAtLocation(stmt.moduleSpecifier);
        if (symbol) for (const exp of checker.getExportsOfModule(symbol)) if (exp.name !== 'default') add(exp.name, spec);
      }
    } else if (ts.getCombinedModifierFlags(stmt as ts.Declaration) & ts.ModifierFlags.Export) {
      const decl = stmt as ts.Declaration & { name?: ts.Identifier };
      if (decl.name) add(decl.name.text, '(local)');
    }
  }
  return names;
}

describe('src/index.ts barrel', () => {
  it('exports every name exactly once', () => {
    const names = collectExportNames();
    expect(names.size).toBeGreaterThan(100);
    const duplicates = [...names].filter(([, from]) => from.length > 1).map(([name, from]) => `${name} <- ${from.join(', ')}`);
    expect(duplicates).toEqual([]);
  }, 60_000);
});
