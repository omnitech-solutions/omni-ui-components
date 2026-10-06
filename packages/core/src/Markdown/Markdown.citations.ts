// Minimal mdast shapes: the plugin only needs these, and `@types/mdast` is not a direct dependency.
interface MdText {
  type: 'text';
  value: string;
}
interface MdParent {
  type: string;
  children: MdNode[];
  data?: Record<string, unknown>;
}
type MdNode = MdText | MdParent;
type Root = MdParent;
type Parent = MdParent;
type Text = MdText;
type PhrasingContent = MdNode;

/** The element name the citation plugin emits; `Markdown` maps it to the pill. */
export const CITE_ELEMENT = 'oui-cite';

/**
 * remark plugin: turns `[2]` into a citation node when a source numbered 2 exists. Only text nodes are visited, so
 * code (inline or fenced) is never touched, and a number nobody cites stays plain text.
 */
export function remarkCitations(cited: ReadonlySet<number>) {
  return () => (tree: Root) => {
    if (!cited.size) return;
    const visit = (node: Parent) => {
      for (let index = 0; index < node.children.length; index++) {
        const child = node.children[index] as Parent | Text;
        if (child.type === 'text') {
          const pieces = (child as Text).value.split(/(\[\d{1,3}\])/);
          if (pieces.length === 1) continue;
          const replacement: PhrasingContent[] = pieces.filter(Boolean).map((piece) => {
            const match = /^\[(\d{1,3})\]$/.exec(piece);
            const n = match ? Number(match[1]) : 0;
            return cited.has(n)
              ? ({
                  type: 'emphasis',
                  data: { hName: CITE_ELEMENT, hProperties: { n } },
                  children: [{ type: 'text', value: String(n) }],
                } as PhrasingContent)
              : ({ type: 'text', value: piece } as Text);
          });
          node.children.splice(index, 1, ...(replacement as never[]));
          index += replacement.length - 1;
        } else if ('children' in child && child.type !== 'code' && child.type !== 'inlineCode') visit(child);
      }
    };
    visit(tree);
  };
}
