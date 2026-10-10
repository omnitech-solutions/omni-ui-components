/**
 * The code of a story that renders an example component from its factories file: the example as it is written
 * there (see `buildExampleCode`). The code is built the first time it is opened or copied, so the parser that
 * reads the file is not loaded by a story nobody asks the code of.
 *
 * @example
 * import factories from './OutlineList.factories.tsx?raw';
 * export const Default: Story = { render: () => <QuestionsPanel />, parameters: exampleDocs(factories, 'QuestionsPanel') };
 */
export function exampleDocs(source: string, target: string) {
  let code: Promise<string> | undefined;
  return {
    example: {
      code: () => {
        code ??= import('./sourceSnippet').then((module) =>
          module.buildExampleCode(source, target),
        );
        return code;
      },
    },
  };
}
