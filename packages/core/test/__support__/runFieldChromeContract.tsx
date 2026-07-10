import * as React from 'react';
import { render, screen } from '@testing-library/react';

export interface FieldChromeContractArgs<P> {
  name: string;
  Component: React.ComponentType<P>;
  baseProps: P;
  primitiveSelector?: string;
}

// Shared chrome contract for FieldShell-wrapped Omni field components.
export function runFieldChromeContract<P extends Record<string, unknown>>({ name, Component, baseProps, primitiveSelector }: FieldChromeContractArgs<P>): void {
  describe(`${name} field chrome contract`, () => {
    it('renders the label', () => {
      render(<Component {...(baseProps as any)} label="My Label" />);
      expect(screen.getByText('My Label')).toBeInTheDocument();
    });
    it('renders description when no error', () => {
      render(<Component {...(baseProps as any)} description="Help" />);
      expect(screen.getByText('Help')).toBeInTheDocument();
    });
    it('hides description when error is present', () => {
      render(<Component {...(baseProps as any)} description="Help" error="Oops" />);
      expect(screen.queryByText('Help')).not.toBeInTheDocument();
      expect(screen.getByText('Oops')).toBeInTheDocument();
    });
    it('adds asterisk when label + required', () => {
      render(<Component {...(baseProps as any)} label="X" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });
    if (primitiveSelector) {
      it('sets aria-invalid on the control when error is present', () => {
        const { container } = render(<Component {...(baseProps as any)} error="Oops" />);
        const el = container.querySelector(primitiveSelector);
        expect(el).toHaveAttribute('aria-invalid', 'true');
      });
    }
  });
}
