/**
 * 40px hit area for the 36px control row.
 *
 * A transparent `::before` (rules in `styles/tokens.css`, keyed on these classes) is stretched past the control's box by half
 * the shortfall between the control's own height (`--oui-hit-base`, default `--oui-control-height`) and `--oui-control-hit`,
 * so a click or touch just outside the visible edge still lands on the control. The pseudo-element is out of flow, so layout
 * never changes. The offset is clamped at zero, and `--oui-hit-border` (default 0px) adds the owner's own border width, since an
 * inset is measured from the padding box. The 52px labelled mode does not use these classes at all. With
 * `html[data-oui-hit-outline]` set (the Storybook "Hit area" toggle) the area is outlined.
 */

/** Both axes: a square control (IconButton). */
export const hitAreaBoth = 'oui-hit';

/** Vertical only: a control whose width already exceeds the hit target (Button, a Segmented option). */
export const hitAreaY = 'oui-hit oui-hit-y';

/** Leading segment of a joined control: grows up, down and outward on the left, never into its neighbour. */
export const hitAreaStart = 'oui-hit oui-hit-start';

/** Trailing segment of a joined control: grows up, down and outward on the right, never into its neighbour. */
export const hitAreaEnd = 'oui-hit oui-hit-end';
