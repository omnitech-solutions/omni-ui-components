import '@testing-library/jest-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { vi } from 'vitest';

import { Calendar } from '../../src/components/ui/calendar';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '../../src/components/ui/command';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../../src/components/ui/dropdown-menu';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '../../src/components/ui/input-otp';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from '../../src/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '../../src/components/ui/sheet';

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  Element.prototype.scrollIntoView ??= () => undefined;
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.setPointerCapture ??= () => undefined;
  Element.prototype.releasePointerCapture ??= () => undefined;
});

describe('components/ui/dropdown-menu', () => {
  const Menu = ({ onSelect = vi.fn(), content = {} }: { onSelect?: () => void; content?: Record<string, unknown> }) => (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <DropdownMenuContent {...content}>
        <DropdownMenuLabel inset>Account</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem inset onSelect={onSelect}>
            Profile
            <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem disabled onSelect={onSelect}>
            Billing
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuSub open>
          <DropdownMenuSubTrigger inset>More</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Nested</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  it('renders labels, shortcut, separator and a nested submenu', () => {
    render(<Menu />);
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('⌘P')).toBeInTheDocument();
    expect(screen.getByRole('separator')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Nested' })).toBeInTheDocument();
  });

  it('selecting an item calls onSelect, and a disabled item cannot be selected', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Menu onSelect={onSelect} />);
    await user.click(screen.getByRole('menuitem', { name: 'Billing' }));
    expect(onSelect).not.toHaveBeenCalled();
    await user.click(screen.getByRole('menuitem', { name: /Profile/ }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('renders inside the trigger tree when portal is false', () => {
    const { container } = render(<Menu content={{ portal: false }} />);
    expect(container.querySelector('[role="menu"]')).toBeInTheDocument();
  });

  it('renders into a custom portal container', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    render(<Menu content={{ container: host }} />);
    expect(host.querySelector('[role="menu"]')).toBeInTheDocument();
    host.remove();
  });

  const CheckMenu = ({ onChecked = vi.fn(), onValue = vi.fn() }: { onChecked?: (v: boolean) => void; onValue?: (v: string) => void }) => (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuCheckboxItem checked onCheckedChange={onChecked}>
          Show grid
        </DropdownMenuCheckboxItem>
        <DropdownMenuRadioGroup value="a" onValueChange={onValue}>
          <DropdownMenuRadioItem value="a">Alpha</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="b">Beta</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  it('checkbox items report their checked state', async () => {
    const user = userEvent.setup();
    const onChecked = vi.fn();
    render(<CheckMenu onChecked={onChecked} />);
    expect(screen.getByRole('menuitemcheckbox', { name: 'Show grid' })).toHaveAttribute('aria-checked', 'true');
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Show grid' }));
    expect(onChecked).toHaveBeenCalledWith(false);
  });

  it('radio items report their value and mark the current one', async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    render(<CheckMenu onValue={onValue} />);
    expect(screen.getByRole('menuitemradio', { name: 'Alpha' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('menuitemradio', { name: 'Beta' })).toHaveAttribute('aria-checked', 'false');
    await user.click(screen.getByRole('menuitemradio', { name: 'Beta' }));
    expect(onValue).toHaveBeenCalledWith('b');
  });
});

describe('components/ui/sheet', () => {
  const Demo = (props: { side?: 'top' | 'bottom' | 'left' | 'right'; overlay?: boolean }) => (
    <Sheet>
      <SheetTrigger>Open sheet</SheetTrigger>
      <SheetContent {...props}>
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>Tune things</SheetDescription>
        </SheetHeader>
        <SheetFooter>Footer</SheetFooter>
      </SheetContent>
    </Sheet>
  );

  it('opens from the trigger and closes with its Close button', async () => {
    const user = userEvent.setup();
    render(<Demo />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByText('Open sheet'));
    const dialog = screen.getByRole('dialog', { name: 'Settings' });
    expect(within(dialog).getByText('Tune things')).toBeInTheDocument();
    expect(within(dialog).getByText('Footer')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.click(screen.getByText('Open sheet'));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it.each([
    ['top', 'inset-x-0'],
    ['bottom', 'bottom-0'],
    ['left', 'left-0'],
    ['right', 'right-0'],
  ] as const)('side %s applies its edge class', async (side, cls) => {
    const user = userEvent.setup();
    render(<Demo side={side} />);
    await user.click(screen.getByText('Open sheet'));
    expect(screen.getByRole('dialog')).toHaveClass(cls);
  });

  it('omits the backdrop when overlay is false', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Demo />);
    await user.click(screen.getByText('Open sheet'));
    expect(document.querySelector('.fixed.inset-0.bg-black\\/45')).toBeInTheDocument();
    unmount();

    render(<Demo overlay={false} />);
    await user.click(screen.getByText('Open sheet'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(document.querySelector('.fixed.inset-0.bg-black\\/45')).toBeNull();
  });
});

describe('components/ui/select', () => {
  it('opens, shows groups/labels/separators and selects an item', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Select onValueChange={onValueChange}>
        <SelectTrigger aria-label="Fruit">
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectItem value="pear">Pear</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(screen.getByText('Pick one')).toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: 'Fruit' }));
    expect(screen.getByText('Fruits')).toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: 'Pear' }));
    expect(onValueChange).toHaveBeenCalledWith('pear');
  });
});

describe('components/ui/command', () => {
  it('filters items, shows the empty state, and fires onSelect', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Command>
        <CommandInput placeholder="Search" />
        <CommandList>
          <CommandEmpty>Nothing</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={onSelect}>
              Copy<CommandShortcut>⌘C</CommandShortcut>
            </CommandItem>
            <CommandSeparator />
            <CommandItem>Paste</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );
    expect(screen.getByText('⌘C')).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText('Search'), 'zzz');
    expect(screen.getByText('Nothing')).toBeInTheDocument();
    await user.clear(screen.getByPlaceholderText('Search'));
    await user.type(screen.getByPlaceholderText('Search'), 'cop');
    expect(screen.queryByText('Paste')).not.toBeInTheDocument();
    await user.click(screen.getByText('Copy'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('CommandDialog renders the command inside a dialog', () => {
    render(
      <CommandDialog open>
        <CommandInput placeholder="Jump to" />
        <CommandList>
          <CommandItem>Home</CommandItem>
        </CommandList>
      </CommandDialog>,
    );
    expect(within(screen.getByRole('dialog')).getByPlaceholderText('Jump to')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
  });
});

describe('components/ui/input-otp', () => {
  it('fills slots as digits are typed and reports completion', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onComplete = vi.fn();
    render(
      <InputOTP maxLength={4} onChange={onChange} onComplete={onComplete} data-testid="otp">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>,
    );
    expect(screen.getByRole('separator')).toBeInTheDocument();
    await user.click(screen.getByTestId('otp'));
    await user.keyboard('1234');
    expect(onChange).toHaveBeenLastCalledWith('1234');
    expect(onComplete).toHaveBeenCalledWith('1234');
    expect(screen.getByText('4')).toBeInTheDocument();
  });
});

describe('components/ui/calendar', () => {
  it('renders week numbers, marks the selected day and navigates months with the chevrons', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Calendar mode="single" showWeekNumber selected={new Date(2026, 6, 15)} defaultMonth={new Date(2026, 6, 1)} onSelect={onSelect} />);
    expect(screen.getByText(/July 2026/)).toBeInTheDocument();
    expect(document.querySelectorAll('td .text-center').length).toBeGreaterThan(0);
    expect(document.querySelector('[data-selected-single="true"]')).toHaveTextContent('15');

    await user.click(screen.getByRole('button', { name: /next month/i }));
    expect(screen.getByText(/August 2026/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /previous month/i }));
    await user.click(screen.getByRole('button', { name: /previous month/i }));
    expect(screen.getByText(/June 2026/)).toBeInTheDocument();
  });

  it('shows a dropdown caption when asked and lets the user change the month', () => {
    render(<Calendar mode="single" captionLayout="dropdown" defaultMonth={new Date(2026, 6, 1)} startMonth={new Date(2025, 0)} endMonth={new Date(2027, 11)} />);
    const month = screen.getAllByRole('combobox')[0];
    fireEvent.change(month, { target: { value: '0' } });
    expect(document.body).toHaveTextContent(/Jan/);
  });

  it('range selection decorates start, middle and end days', () => {
    render(<Calendar mode="range" selected={{ from: new Date(2026, 6, 10), to: new Date(2026, 6, 14) }} defaultMonth={new Date(2026, 6, 1)} />);
    expect(document.querySelector('[data-range-start="true"]')).toHaveTextContent('10');
    expect(document.querySelector('[data-range-end="true"]')).toHaveTextContent('14');
    expect(document.querySelectorAll('[data-range-middle="true"]')).toHaveLength(3);
  });

  it('moves focus into a day when navigating with the keyboard', async () => {
    const user = userEvent.setup();
    render(<Calendar mode="single" defaultMonth={new Date(2026, 6, 1)} selected={new Date(2026, 6, 15)} onSelect={() => undefined} />);
    const selected = document.querySelector('[data-selected-single="true"]') as HTMLElement;
    selected.focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toHaveTextContent('16');
  });

  it('hides outside days when showOutsideDays is false', () => {
    const { unmount } = render(<Calendar mode="single" defaultMonth={new Date(2026, 6, 1)} />);
    const withOutside = screen.getAllByRole('button', { name: /,/ }).length;
    unmount();
    render(<Calendar mode="single" showOutsideDays={false} defaultMonth={new Date(2026, 6, 1)} />);
    const withoutOutside = screen.getAllByRole('button', { name: /,/ }).length;
    expect(withOutside).toBeGreaterThan(31);
    expect(withoutOutside).toBe(31);
  });
});
