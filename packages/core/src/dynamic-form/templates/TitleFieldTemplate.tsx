import type { TitleFieldProps } from '@rjsf/utils';
import { getUiOptions } from '@rjsf/utils';

/**
 * The title RJSF draws above an array (and any field that asks for one). It is NOT a heading by default: a form
 * sits inside a page whose heading order the library cannot know, and a stray `h5` breaks it. Set
 * `ui:options.headingLevel` (1 to 6), per field or once in `ui:globalOptions`, to make it a heading of that level.
 */
export const TitleFieldTemplate = (props: TitleFieldProps) => {
  const { id, title, required, uiSchema, registry } = props;
  const level = Number(getUiOptions(uiSchema, registry?.globalUiOptions).headingLevel);
  const heading = Number.isInteger(level) && level >= 1 && level <= 6;
  return (
    <div
      id={id}
      data-slot="form-title"
      role={heading ? 'heading' : undefined}
      aria-level={heading ? level : undefined}
      className="font-[family-name:var(--oui-font-sans)] text-sm font-semibold text-[var(--oui-foreground)]"
    >
      {title}
      {required ? (
        <span className="ml-0.5 text-[var(--oui-foreground-required)]" aria-hidden="true">
          *
        </span>
      ) : null}
    </div>
  );
};
