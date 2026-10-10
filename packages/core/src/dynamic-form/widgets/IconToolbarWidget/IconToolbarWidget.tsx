import { Button, IconButton, type IconButtonVariant } from '@oc-tech/omni-ui-components';
import type { WidgetProps } from '@rjsf/utils';
import { formContextOf, widgetGroupName } from '../../lib/widgetKit';

/**
 * One entry of `ui:options.actions`: plain data. It names an action; the host supplies the action itself (its
 * words, its icon node and what it does) in `formContext.actions[actionKey]`. No function and no icon name ever
 * sits in a schema.
 */
export interface IconToolbarAction {
  actionKey: string;
  variant?: IconButtonVariant;
}

const isAction = (entry: unknown): entry is IconToolbarAction =>
  typeof entry === 'object' &&
  entry !== null &&
  typeof (entry as IconToolbarAction).actionKey === 'string';

/**
 * `iconToolbar`: a row of actions that belong to the form (duplicate, clear, delete). It holds no value and
 * nothing is submitted. An entry whose key the host did not supply is not drawn; an action with no icon is
 * drawn as a text button; an action with an `href` and no `onSelect` is a link.
 *
 * @example
 * uiSchema: { quick: { 'ui:widget': 'iconToolbar', 'ui:options': { actions: [{ actionKey: 'duplicate', variant: 'ghost' }] } } }
 * formContext: { actions: { duplicate: { actionId: 'duplicate', label: 'Duplicate', href: null, icon: <Copy />, onSelect: duplicate } } }
 */
export const IconToolbarWidget = (props: WidgetProps) => {
  const { id, options, disabled, readonly } = props;
  const context = formContextOf(props);
  const entries = Array.isArray(options?.actions) ? options.actions.filter(isAction) : [];
  const isDisabled = Boolean(disabled || readonly);

  return (
    <div
      id={id}
      role="toolbar"
      {...widgetGroupName(props)}
      data-slot="icon-toolbar"
      className="inline-flex items-center gap-1 self-start rounded-md border border-[var(--oui-border-field)] p-1"
    >
      {entries.map((entry) => {
        const action = context.actions?.[entry.actionKey];
        if (!action) return null;
        const onClick = action.onSelect ? () => action.onSelect?.(action) : undefined;
        if (action.href && !action.onSelect) {
          return (
            <a
              key={entry.actionKey}
              href={action.href}
              data-action-id={action.actionId}
              className="inline-flex items-center gap-1 px-2 text-sm font-medium text-[color:var(--oui-foreground-primary)] hover:underline [&_svg]:size-4"
            >
              {action.icon}
              {action.label}
            </a>
          );
        }
        return action.icon ? (
          <IconButton
            key={entry.actionKey}
            aria-label={action.label}
            title={action.label}
            variant={entry.variant}
            disabled={isDisabled}
            data-action-id={action.actionId}
            onClick={onClick}
            icon={action.icon}
          />
        ) : (
          <Button
            key={entry.actionKey}
            buttonSize="sm"
            disabled={isDisabled}
            data-action-id={action.actionId}
            onClick={onClick}
          >
            {action.label}
          </Button>
        );
      })}
    </div>
  );
};
