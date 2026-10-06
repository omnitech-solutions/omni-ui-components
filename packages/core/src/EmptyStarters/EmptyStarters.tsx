import * as React from 'react';

import { cn } from 'lib/utils';
import { STARTER_CARD_CLASS, starterGridVariants } from './EmptyStarters.variants';
import type { EmptyStartersLabels, EmptyStartersProps, StarterItem } from './EmptyStarters.types';

export const DEFAULT_EMPTY_STARTERS_LABELS: EmptyStartersLabels = { starters: 'Suggested prompts' };

/**
 * Omni EmptyStarters: the empty conversation. A heading, an optional description and starter cards (`icon`, `title`,
 * `subtitle`, `prompt`); choosing a card calls `onStart(prompt)` so the app sends it. It fills its parent and centres,
 * so it drops into a Panel body or the PanelShell.
 *
 * Slots: `data-slot="empty-starters" | "empty-starters-title" | "empty-starters-grid" | "empty-starter"`.
 *
 * @example
 * <EmptyStarters title="What are we working on?" description="Ask anything about the interview."
 *   starters={[{ icon: <Sparkles />, title: 'Explain a concept', subtitle: 'Spoken in 60 seconds', prompt: 'Explain closures' }]}
 *   onStart={(prompt) => send(prompt)} />
 */
export const EmptyStarters = <S extends StarterItem = StarterItem>({ title, description, starters = [], onStart, columns = 2, labels: labelOverrides, className, ...rest }: EmptyStartersProps<S>) => {
  const labels = { ...DEFAULT_EMPTY_STARTERS_LABELS, ...labelOverrides };
  return (
    <div data-slot="empty-starters" className={cn('flex flex-1 flex-col items-center justify-center gap-5 px-5 py-8 text-center', className)} {...rest}>
      <div className="flex max-w-[420px] flex-col gap-1.5">
        <h2 data-slot="empty-starters-title" className="m-0 text-[20px] leading-tight font-semibold tracking-tight">
          {title}
        </h2>
        {description ? <p className="m-0 text-[13px] leading-normal text-[color:var(--oui-panel-meta-fg)]">{description}</p> : null}
      </div>
      {starters.length && onStart ? (
        <div role="group" aria-label={labels.starters} data-slot="empty-starters-grid" className={starterGridVariants({ columns })}>
          {starters.map((starter) => (
            <button
              key={starter.key ?? starter.title}
              type="button"
              data-slot="empty-starter"
              className={STARTER_CARD_CLASS}
              onClick={() => void onStart(starter)}
            >
              {starter.icon ? (
                <span aria-hidden="true" className="text-[color:var(--oui-tone-accent-fg)] [&_svg]:size-[18px]">
                  {starter.icon}
                </span>
              ) : null}
              <span className="text-[13.5px] font-semibold">{starter.title}</span>
              {starter.subtitle ? <span className="text-xs leading-snug text-[color:var(--oui-panel-meta-fg)]">{starter.subtitle}</span> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};
