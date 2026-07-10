import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';

import { SubmitButton } from 'dynamic-form/templates/ButtonTemplates';

/* RJSF v6's SubmitButtonProps surface is sparse; we only use `uiSchema`
 * via `getSubmitButtonOptions`. Mock just that input. */
const mkProps = (uiSchema: Record<string, unknown> = {}): React.ComponentProps<typeof SubmitButton> =>
  ({ uiSchema, registry: {} }) as unknown as React.ComponentProps<typeof SubmitButton>;

describe('dynamic-form SubmitButton template', () => {
  it('renders a submit button with the default "Submit" label', () => {
    render(<SubmitButton {...mkProps()} />);
    const btn = screen.getByRole('button', { name: /submit/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('type', 'submit');
  });

  it('honours ui:submitButtonOptions.submitText', () => {
    render(<SubmitButton {...mkProps({ 'ui:submitButtonOptions': { submitText: 'Save now' } })} />);
    expect(screen.getByRole('button', { name: 'Save now' })).toBeInTheDocument();
  });

  it('renders nothing when ui:submitButtonOptions.norender = true', () => {
    const { container } = render(<SubmitButton {...mkProps({ 'ui:submitButtonOptions': { norender: true } })} />);
    expect(container.querySelector('[data-slot="rjsf-submit-button"]')).not.toBeInTheDocument();
    expect(container.querySelector('button')).not.toBeInTheDocument();
  });

  it('forwards className from ui:submitButtonOptions.props', () => {
    render(<SubmitButton {...mkProps({ 'ui:submitButtonOptions': { submitText: 'Go', props: { className: 'cta-blue' } } })} />);
    expect(screen.getByRole('button', { name: 'Go' })).toHaveClass('cta-blue');
  });
});
