import '@testing-library/jest-dom';

import { Typography } from '@oc-tech/omni-ui-components/Typography';
import { render, screen } from '@testing-library/react';

describe('omni-ui-components/Typography', () => {
  it('renders title, paragraph, and link', () => {
    render(
      <div>
        <Typography.Title>Title</Typography.Title>
        <Typography.Paragraph>Body</Typography.Paragraph>
        <Typography.Link href="/x">Link</Typography.Link>
      </div>,
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Link' })).toHaveAttribute('href', '/x');
  });
});

describe('omni-ui-components/Typography tones', () => {
  it('paints warning and success from the theme tone tokens, so they follow light and dark', () => {
    render(
      <div>
        <Typography.Text type="warning">Late</Typography.Text>
        <Typography.Text type="success">Done</Typography.Text>
      </div>,
    );
    expect(screen.getByText('Late').className).toContain('--oui-tone-warning-fg');
    expect(screen.getByText('Done').className).toContain('--oui-tone-success-fg');
  });

  it('passes role and data attributes through', () => {
    render(
      <Typography.Text role="status" data-testid="line">
        Saved
      </Typography.Text>,
    );
    expect(screen.getByRole('status')).toBe(screen.getByTestId('line'));
  });
});

describe('omni-ui-components/Typography sizes', () => {
  it('is the default size unless asked, and says which on the element', () => {
    render(<Typography.Text>Plain</Typography.Text>);
    const text = screen.getByText('Plain');
    expect(text).toHaveAttribute('data-size', 'default');
    expect(text.className).toContain('text-sm');
  });

  it('compact is one step smaller and tighter on every part', () => {
    render(
      <div>
        <Typography.Text size="compact">Text</Typography.Text>
        <Typography.Paragraph size="compact">Paragraph</Typography.Paragraph>
        <Typography.Title size="compact">Title</Typography.Title>
        <Typography.Link size="compact" href="/x">
          Link
        </Typography.Link>
      </div>,
    );
    for (const name of ['Text', 'Paragraph', 'Link']) {
      const part = screen.getByText(name);
      expect(part).toHaveAttribute('data-size', 'compact');
      expect(part.className).toContain('text-[13px]');
      expect(part.className).not.toContain('text-sm');
    }
    expect(screen.getByText('Title').className).toContain('text-xl');
    expect(screen.getByText('Title').className).not.toContain('text-3xl');
  });

  it('keeps its tone at the compact size', () => {
    render(
      <Typography.Text size="compact" type="secondary">
        Quiet
      </Typography.Text>,
    );
    expect(screen.getByText('Quiet').className).toContain('--oui-foreground-muted');
  });
});

describe('omni-ui-components/Typography options', () => {
  it('without the new props a title is the same h2 and a text the same span as before', () => {
    render(
      <div>
        <Typography.Title>Title</Typography.Title>
        <Typography.Text>Text</Typography.Text>
      </div>,
    );
    const title = screen.getByRole('heading', { level: 2, name: 'Title' });
    expect(title.className).toBe(
      'font-[family-name:var(--oui-font-sans)] font-semibold tracking-tight text-balance text-3xl text-[var(--oui-foreground)]',
    );
    const text = screen.getByText('Text');
    expect(text.tagName).toBe('SPAN');
    expect(text.className).toBe(
      'font-[family-name:var(--oui-font-sans)] text-sm leading-6 text-[var(--oui-foreground)]',
    );
  });

  it('level picks the heading element and its size step', () => {
    render(
      <div>
        <Typography.Title level={1}>One</Typography.Title>
        <Typography.Title level={3}>Three</Typography.Title>
        <Typography.Title level={4} size="compact">
          Four
        </Typography.Title>
      </div>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'One' })).toHaveClass('text-4xl');
    expect(screen.getByRole('heading', { level: 3, name: 'Three' })).toHaveClass('text-2xl');
    expect(screen.getByRole('heading', { level: 4, name: 'Four' })).toHaveClass('text-base');
  });

  it('code, keyboard and strong', () => {
    render(
      <div>
        <Typography.Text code>retries</Typography.Text>
        <Typography.Text keyboard>Ctrl</Typography.Text>
        <Typography.Text strong>Saved</Typography.Text>
      </div>,
    );
    expect(screen.getByText('retries').tagName).toBe('CODE');
    expect(screen.getByText('retries')).toHaveClass('font-mono');
    expect(screen.getByText('retries').className).toContain('--oui-surface-field');
    expect(screen.getByText('Ctrl').tagName).toBe('KBD');
    expect(screen.getByText('Saved')).toHaveClass('font-semibold');
  });
});
