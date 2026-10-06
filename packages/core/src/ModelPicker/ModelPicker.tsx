import * as React from 'react';

import { cn } from 'lib/utils';
import { useControllableState } from '../lib/use-controllable-state';
import { Button } from '../Button';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import { SegmentedPrimitive } from '../Segmented';
import { capabilitiesOf, DEFAULT_EFFORT_LABELS, EFFORT_ORDER, groupModels, modelLabel, shortName, withLabelDefaults } from './ModelPicker.utils';
import { modelChipClasses, modelGroupLabelClasses, modelMenuClasses, modelRowClasses, modelTagClasses } from './ModelPicker.variants';
import type { ModelEffortOption, ModelInfo, ModelMenuProps, ModelPickerLabels, ModelPickerProps } from './ModelPicker.types';

/** English defaults for every string. */
export const DEFAULT_MODEL_PICKER_LABELS: ModelPickerLabels = {
  dialog: 'Model',
  noModel: 'Choose a model',
  models: 'Models',
  local: 'Local · ',
  capabilities: { context: '{n} context', tools: 'tools', vision: 'vision', reasoning: 'reasoning' },
  goodFor: 'Good for {strengths}',
  effortTitle: 'Reasoning effort',
  effortNote: 'Higher effort is slower but more careful.',
  effortIgnored: '{model} doesn’t reason step by step — effort is ignored.',
  efforts: DEFAULT_EFFORT_LABELS,
  addProvider: 'Add a cloud provider (optional)',
};

/** One model: name and tags, what it can do, what it is good for. Colour is kept for the selection. */
const ModelRow: React.FC<{ model: ModelInfo; selected: boolean; labels: ModelPickerLabels; check?: React.ReactNode; onPick?: () => void }> = ({
  model,
  selected,
  labels,
  check,
  onPick,
}) => {
  const capabilities = capabilitiesOf(model, labels.capabilities);
  return (
    <button type="button" aria-pressed={selected} title={model.description} data-slot="model-row" className={modelRowClasses} onClick={onPick}>
      <div className="min-w-0 flex-1 leading-[1.35]">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-medium">{model.name}</span>
          {model.tags?.map((tag) => (
            <span key={tag} data-slot="model-tag" className={modelTagClasses}>
              {tag}
            </span>
          ))}
        </div>
        {capabilities ? (
          <div data-slot="model-capabilities" className="text-xs text-[color:var(--oui-panel-meta-fg)]">
            {capabilities}
          </div>
        ) : null}
        {model.strengths?.length ? (
          <div data-slot="model-strengths" className="text-xs text-[color:var(--oui-panel-meta-fg)]">
            {labels.goodFor.replace('{strengths}', model.strengths.join(', '))}
          </div>
        ) : null}
        {model.description ? <div className="text-xs text-[color:var(--oui-panel-meta-fg)]">{model.description}</div> : null}
      </div>
      {selected && check ? (
        <span aria-hidden="true" className="mt-0.5 inline-flex shrink-0 text-[color:var(--oui-tone-accent-fg)] [&_svg]:size-4">
          {check}
        </span>
      ) : null}
    </button>
  );
};

/**
 * The model menu on its own (`role="dialog"`): models in sections of consecutive providers, one row per model, the
 * reasoning-effort Segmented and an optional "Add a cloud provider" action. `ModelPicker` puts it in a popover under
 * a chip; this is the part to use when the surface is yours.
 *
 * @example
 * <ModelMenu models={models} selectedId={id} effort={effort} onPick={setId} onEffortChange={setEffort} />
 */
const ModelMenuInner = React.forwardRef<HTMLDivElement, ModelMenuProps>(
  (
    { models, provider, selectedId: selectedProp, defaultSelectedId, effort: effortProp, defaultEffort = 'medium', efforts, showEffort = true, onPick, onEffortChange, onAddProvider, labels: labelsProp, icons, className, ...rest },
    ref,
  ) => {
    const labels = React.useMemo(() => withLabelDefaults(DEFAULT_MODEL_PICKER_LABELS, labelsProp), [labelsProp]);
    // Selection and effort work controlled or not; the callbacks fire either way.
    const [selectedId, setSelectedId] = useControllableState<string | undefined>(selectedProp, defaultSelectedId);
    const [effort, setEffort] = useControllableState<string>(effortProp, defaultEffort);
    const selected = models.find((model) => model.id === selectedId);
    const options: ModelEffortOption[] = efforts ?? EFFORT_ORDER.map((value) => ({ value, label: labels.efforts[value] }));
    return (
      <div ref={ref} role="dialog" aria-label={labels.dialog} data-slot="model-menu" className={cn('flex flex-col', className)} {...rest}>
        {groupModels(models, provider).map(({ provider: group, models: list }) => (
          <section key={group ? `${group.name}|${group.endpoint ?? ''}` : 'models'} aria-label={group?.name ?? labels.models} data-slot="model-group">
            {group ? (
              <div data-slot="model-group-label" className={modelGroupLabelClasses}>
                <span aria-hidden="true" className="size-1.5 rounded-full bg-[color:var(--oui-tone-success-solid-bg)]" />
                {group.local ? labels.local : ''}
                {group.name}
                <span className="flex-1" />
                {group.endpoint ? <span className="font-mono font-normal">{group.endpoint}</span> : null}
              </div>
            ) : null}
            {list.map((model) => (
              <ModelRow key={model.id} model={model} selected={model.id === selectedId} labels={labels} check={icons?.check} onPick={() => {
                  setSelectedId(model.id);
                  void onPick?.(model);
                }} />
            ))}
          </section>
        ))}
        {showEffort ? (
          <fieldset
            aria-label={labels.effortTitle}
            data-slot="model-effort"
            className="m-0 mt-1.5 flex min-w-0 flex-col gap-1.5 border-0 border-t border-solid border-[color:var(--oui-panel-divider)] px-2.5 pt-2.5 pb-1.5"
          >
            <div aria-hidden="true" className="text-[11.5px] font-medium text-[color:var(--oui-panel-meta-fg)]">
              {labels.effortTitle}
            </div>
            <SegmentedPrimitive
              options={options}
              value={effort}
              onChange={(next) => {
                setEffort(next);
                void onEffortChange?.(next, selected);
              }}
              className="w-full [&>button]:flex-1 [&>button]:px-2"
            />
            <div data-slot="model-effort-note" className="text-xs text-[color:var(--oui-panel-meta-fg)]">
              {selected?.reasoning ? labels.effortNote : labels.effortIgnored.replace('{model}', shortName(selected))}
            </div>
          </fieldset>
        ) : null}
        {onAddProvider ? (
          <div className="mt-1.5 border-t border-solid border-[color:var(--oui-panel-divider)] pt-1.5">
            <Button type="button" variant="ghost" buttonSize="sm" icon={icons?.add} className="w-full justify-start text-[13px] text-[color:var(--oui-panel-meta-fg)]" onClick={() => void onAddProvider()}>
              {labels.addProvider}
            </Button>
          </div>
        ) : null}
      </div>
    );
  },
);
ModelMenuInner.displayName = 'ModelMenu';

/** Generic over the model type: extra fields on your models reach `onPick` and `onEffortChange` by reference. */
export const ModelMenu = ModelMenuInner as <M extends ModelInfo = ModelInfo>(props: ModelMenuProps<M> & React.RefAttributes<HTMLDivElement>) => React.ReactElement | null;

/**
 * Omni ModelPicker: a chip (`ShortName · Effort` for a reasoning model, the name otherwise) that opens the model
 * menu in a popover. Picking a model closes the menu; changing the effort does not. The popover returns focus to the
 * chip on close and closes on Escape; focus moves into the menu on open.
 *
 * @example
 * <ModelPicker models={models} selectedId={id} effort={effort} onPick={setId} onEffortChange={setEffort} icons={{ check: <Check />, expand: <ChevronDown /> }} />
 */
const ModelPickerInner = React.forwardRef<HTMLButtonElement, ModelPickerProps>(
  ({ open: openProp, defaultOpen = false, onOpenChange, disabled, align = 'start', side = 'top', className, menuClassName, onPick, onEffortChange, selectedId: selectedProp, defaultSelectedId, effort: effortProp, defaultEffort = 'medium', labels: labelsProp, icons, 'data-testid': testId, ...menu }, ref) => {
    const labels = React.useMemo(() => withLabelDefaults(DEFAULT_MODEL_PICKER_LABELS, labelsProp), [labelsProp]);
    const [open, setOpen] = useControllableState<boolean>(openProp, defaultOpen, onOpenChange);
    // The popover returns focus to the chip only after its exit animation; picking or Escape puts it there at once.
    const chipRef = React.useRef<HTMLButtonElement | null>(null);
    // The menu unmounts when closed, so the chip holds the selection and effort.
    const [selectedId, setSelectedId] = useControllableState<string | undefined>(selectedProp, defaultSelectedId);
    const [effort, setEffort] = useControllableState<string>(effortProp, defaultEffort);
    const selected = menu.models.find((model) => model.id === selectedId);
    const effortLabels = menu.efforts ? Object.fromEntries(menu.efforts.map((option) => [option.value, option.label])) : labels.efforts;
    const text = modelLabel(selected, effort, effortLabels) || labels.noModel;
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={(node) => {
              chipRef.current = node;
              if (typeof ref === 'function') ref(node);
              else if (ref) ref.current = node;
            }}
            type="button"
            variant="ghost"
            buttonSize="sm"
            disabled={disabled}
            iconAfter={icons?.expand}
            aria-haspopup="dialog"
            aria-expanded={open}
            data-slot="model-chip"
            data-testid={testId}
            className={cn(modelChipClasses, className)}
          >
            <span className="truncate">{text}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align={align} side={side} sideOffset={6} aria-label={labels.dialog} className={cn(modelMenuClasses, menuClassName)} onEscapeKeyDown={() => chipRef.current?.focus()}>
          {/* The popover content is the dialog (role and name), so the menu inside is a plain container. */}
          <ModelMenu
            {...menu}
            role={undefined}
            aria-label={undefined}
            labels={labelsProp}
            icons={icons}
            selectedId={selectedId}
            effort={effort}
            onEffortChange={(next, model) => {
              setEffort(next);
              return onEffortChange?.(next, model);
            }}
            onPick={(model) => {
              setSelectedId(model.id);
              setOpen(false);
              chipRef.current?.focus();
              return onPick?.(model);
            }}
          />
        </PopoverContent>
      </Popover>
    );
  },
);
ModelPickerInner.displayName = 'ModelPicker';

/** Generic over the model type: extra fields on your models reach every callback by reference. */
export const ModelPicker = ModelPickerInner as <M extends ModelInfo = ModelInfo>(props: ModelPickerProps<M> & React.RefAttributes<HTMLButtonElement>) => React.ReactElement | null;
