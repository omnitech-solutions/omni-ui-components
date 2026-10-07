import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { vi } from 'vitest';

import { Alert } from '../../src/components/ui/alert';
import { Avatar, AvatarFallback } from '../../src/components/ui/avatar';
import { Button } from '../../src/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../src/components/ui/card';
import { Checkbox } from '../../src/components/ui/checkbox';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../../src/components/ui/hover-card';
import { Input } from '../../src/components/ui/input';
import { Label } from '../../src/components/ui/label';
import { Slider } from '../../src/components/ui/slider';
import { Textarea } from '../../src/components/ui/textarea';
import { Toggle } from '../../src/components/ui/toggle';

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

describe('components/ui/alert', () => {
  it.each([
    ['info', 'status', 'polite'],
    ['success', 'status', 'polite'],
    ['loading', 'status', 'polite'],
    ['warning', 'alert', 'assertive'],
    ['error', 'alert', 'assertive'],
  ] as const)('%s variant uses role %s and aria-live %s', (variant, role, live) => {
    render(<Alert variant={variant}>Body</Alert>);
    const el = screen.getByRole(role);
    expect(el).toHaveAttribute('aria-live', live);
    expect(el).toHaveAttribute('aria-atomic', 'true');
    expect(el).toHaveTextContent('Body');
  });

  it('shows a title, and no icon padding without an icon', () => {
    render(<Alert title="Heads up">Body</Alert>);
    expect(screen.getByText('Heads up')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveClass('pl-5');
  });

  it('uses the smaller no-icon padding for size sm', () => {
    render(<Alert size="sm">Body</Alert>);
    expect(screen.getByRole('status')).toHaveClass('pl-4');
  });

  it('decorates a provided icon element (hidden from AT, coloured by variant, keeps its own class)', () => {
    const { rerender } = render(
      <Alert variant="error" icon={<svg data-testid="icon" className="mine" />}>
        Body
      </Alert>,
    );
    expect(screen.getByTestId('icon')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('icon')).toHaveClass('text-danger', 'mine');

    rerender(
      <Alert variant="success" icon={<svg data-testid="icon" />}>
        Body
      </Alert>,
    );
    expect(screen.getByTestId('icon')).toHaveClass('text-primary', 'size-5.5');

    rerender(
      <Alert size="sm" icon={<svg data-testid="icon" />}>
        Body
      </Alert>,
    );
    expect(screen.getByTestId('icon')).toHaveClass('top-3', 'text-light-foreground');
  });

  it('shows a spinner for loading and ignores a null icon', () => {
    const { container, rerender } = render(<Alert variant="loading">Working</Alert>);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    rerender(<Alert icon={null}>Body</Alert>);
    expect(container.querySelector('svg')).toBeNull();
  });

  it('does not render a non-element icon', () => {
    const { container } = render(<Alert icon="text-icon">Body</Alert>);
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.queryByText('text-icon')).not.toBeInTheDocument();
  });

  it('forwards the ref and className', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Alert ref={ref} className="extra">
        Body
      </Alert>,
    );
    expect(ref.current).toBe(screen.getByRole('status'));
    expect(ref.current).toHaveClass('extra');
  });
});

describe('components/ui form primitives', () => {
  it('Input passes type, props and ref through and merges className', () => {
    const ref = React.createRef<HTMLInputElement>();
    const onChange = vi.fn();
    render(<Input ref={ref} type="email" placeholder="you@x" className="extra" onChange={onChange} />);
    const input = screen.getByPlaceholderText('you@x');
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('data-slot', 'input');
    expect(input).toHaveClass('extra');
    fireEvent.change(input, { target: { value: 'a@b.c' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('Textarea forwards value changes and ref', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    const onChange = vi.fn();
    render(<Textarea ref={ref} aria-label="notes" className="extra" onChange={onChange} />);
    const area = screen.getByLabelText('notes');
    expect(ref.current).toBe(area);
    expect(area).toHaveAttribute('data-slot', 'textarea');
    expect(area).toHaveClass('extra');
    fireEvent.change(area, { target: { value: 'hi' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('Label associates with its control and merges className', () => {
    const ref = React.createRef<HTMLLabelElement>();
    render(
      <>
        <Label ref={ref} htmlFor="x" className="extra">
          Name
        </Label>
        <input id="x" />
      </>,
    );
    expect(screen.getByLabelText('Name')).toBe(document.getElementById('x'));
    expect(ref.current).toHaveClass('extra', 'font-medium');
  });

  it('Checkbox toggles and reports the checked state, and shows the indicator only when checked', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const ref = React.createRef<HTMLButtonElement>();
    const { container } = render(<Checkbox ref={ref} aria-label="agree" className="extra" onCheckedChange={onCheckedChange} />);
    const box = screen.getByRole('checkbox', { name: 'agree' });
    expect(ref.current).toBe(box);
    expect(box).toHaveClass('extra');
    expect(container.querySelector('svg')).toBeNull();
    await user.click(box);
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    expect(box).toHaveAttribute('aria-checked', 'true');
    expect(container.querySelector('svg')).toBeInTheDocument();
    await user.click(box);
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
  });

  it('Checkbox does not toggle when disabled', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Checkbox aria-label="agree" disabled onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByRole('checkbox'));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('Toggle flips its pressed state and applies variant and size classes', async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    render(
      <Toggle variant="outline" size="lg" onPressedChange={onPressedChange}>
        Bold
      </Toggle>,
    );
    const toggle = screen.getByRole('button', { name: 'Bold' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(toggle).toHaveClass('border', 'h-11');
    await user.click(toggle);
    expect(onPressedChange).toHaveBeenCalledWith(true);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });

  it('Toggle uses the default and small sizes', () => {
    const { rerender } = render(<Toggle>One</Toggle>);
    expect(screen.getByRole('button')).toHaveClass('h-10');
    rerender(<Toggle size="sm">One</Toggle>);
    expect(screen.getByRole('button')).toHaveClass('h-9');
  });

  it('Button renders as a child element with asChild and applies variants', () => {
    render(
      <Button asChild variant="link" size="sm">
        <a href="/x">Go</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Go' });
    expect(link).toHaveClass('underline-offset-4', 'h-9');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('Button defaults to a plain button and click fires', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button variant="destructive" onClick={onClick}>
        Delete
      </Button>,
    );
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('components/ui slider', () => {
  it('renders one thumb by default and moves it with the keyboard within min/max', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Slider defaultValue={[50]} min={0} max={52} step={1} onValueChange={onValueChange} />);
    const thumb = screen.getByRole('slider');
    thumb.focus();
    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}');
    expect(onValueChange).toHaveBeenLastCalledWith([52]);
    expect(thumb).toHaveAttribute('aria-valuenow', '52');
    await user.keyboard('{Home}');
    expect(onValueChange).toHaveBeenLastCalledWith([0]);
  });

  it('renders a thumb per controlled value and per default value', () => {
    const controlled = render(<Slider value={[10, 90]} onValueChange={() => undefined} />);
    expect(screen.getAllByRole('slider')).toHaveLength(2);
    controlled.unmount();
    const uncontrolled = render(<Slider defaultValue={[1, 2, 3]} />);
    expect(screen.getAllByRole('slider')).toHaveLength(3);
    uncontrolled.unmount();
    render(<Slider />);
    expect(screen.getAllByRole('slider')).toHaveLength(1);
  });

  it('marks the root disabled', () => {
    render(<Slider defaultValue={[5]} disabled />);
    expect(document.querySelector('[data-slot="slider"]')).toHaveAttribute('data-disabled');
  });
});

describe('components/ui card and avatar', () => {
  it('Card composes its sections and keeps custom classes', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Card ref={ref} className="extra">
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Desc</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Foot</CardFooter>
      </Card>,
    );
    expect(ref.current).toHaveClass('extra');
    for (const text of ['Title', 'Desc', 'Body', 'Foot']) expect(screen.getByText(text)).toBeInTheDocument();
  });

  it('Avatar falls back when there is no image', () => {
    render(
      <Avatar className="extra" data-testid="a">
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText('AL')).toBeInTheDocument();
    expect(screen.getByTestId('a')).toHaveClass('extra');
  });
});

describe('components/ui hover-card', () => {
  it('shows its content while open and merges className and offsets', () => {
    render(
      <HoverCard open>
        <HoverCardTrigger asChild>
          <a href="/u">user</a>
        </HoverCardTrigger>
        <HoverCardContent className="extra" data-testid="hc">
          Profile
        </HoverCardContent>
      </HoverCard>,
    );
    expect(screen.getByTestId('hc')).toHaveTextContent('Profile');
    expect(screen.getByTestId('hc')).toHaveClass('extra');
  });

  it('keeps its content closed by default', () => {
    render(
      <HoverCard>
        <HoverCardTrigger asChild>
          <a href="/u">user</a>
        </HoverCardTrigger>
        <HoverCardContent>Profile</HoverCardContent>
      </HoverCard>,
    );
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();
  });
});
