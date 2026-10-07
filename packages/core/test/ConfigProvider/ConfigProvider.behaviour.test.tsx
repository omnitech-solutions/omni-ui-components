import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { ConfigProvider } from '@oc-tech/omni-ui-components/ConfigProvider';

const root = () => document.documentElement;

describe('omni-ui-components/ConfigProvider', () => {
  afterEach(() => {
    delete root().dataset.theme;
    root().removeAttribute('dir');
    root().removeAttribute('style');
  });

  it('renders its children and applies light theme and ltr by default', () => {
    render(
      <ConfigProvider>
        <p>child</p>
      </ConfigProvider>,
    );
    expect(screen.getByText('child')).toBeInTheDocument();
    expect(root().dataset.theme).toBe('light');
    expect(root().dir).toBe('ltr');
  });

  it('applies the theme mode, direction and tokens (with or without a -- prefix; token wins over tokens)', () => {
    render(
      <ConfigProvider theme={{ mode: 'dark', tokens: { 'oui-a': 1, '--oui-b': 'x' }, token: { 'oui-a': 2 } }} direction="rtl">
        <p>child</p>
      </ConfigProvider>,
    );
    expect(root().dataset.theme).toBe('dark');
    expect(root().dir).toBe('rtl');
    expect(root().style.getPropertyValue('--oui-a')).toBe('2');
    expect(root().style.getPropertyValue('--oui-b')).toBe('x');
  });

  it('restores the previous theme, direction and token values on unmount', () => {
    root().dataset.theme = 'dark';
    root().dir = 'rtl';
    root().style.setProperty('--oui-keep', 'before');
    const { unmount } = render(
      <ConfigProvider theme={{ mode: 'light', tokens: { 'oui-keep': 'during', 'oui-new': 'tmp' } }} direction="ltr">
        <p>child</p>
      </ConfigProvider>,
    );
    expect(root().dataset.theme).toBe('light');
    expect(root().style.getPropertyValue('--oui-keep')).toBe('during');
    unmount();
    expect(root().dataset.theme).toBe('dark');
    expect(root().dir).toBe('rtl');
    expect(root().style.getPropertyValue('--oui-keep')).toBe('before');
    expect(root().style.getPropertyValue('--oui-new')).toBe('');
  });

  it('removes the theme attribute on unmount when there was none', () => {
    const { unmount } = render(<ConfigProvider theme={{ mode: 'dark' }} />);
    expect(root().dataset.theme).toBe('dark');
    unmount();
    expect(root().dataset.theme).toBeUndefined();
  });

  it('re-applies when the mode changes', () => {
    const { rerender } = render(<ConfigProvider theme={{ mode: 'light' }} />);
    rerender(<ConfigProvider theme={{ mode: 'dark' }} />);
    expect(root().dataset.theme).toBe('dark');
  });
});
