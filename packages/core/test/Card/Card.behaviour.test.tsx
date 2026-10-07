import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import * as React from 'react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@oc-tech/omni-ui-components/Card';

describe('omni-ui-components/Card', () => {
  it('composes all sections and forwards every ref and className', () => {
    const refs = {
      card: React.createRef<HTMLDivElement>(),
      header: React.createRef<HTMLDivElement>(),
      title: React.createRef<HTMLDivElement>(),
      description: React.createRef<HTMLDivElement>(),
      content: React.createRef<HTMLDivElement>(),
      footer: React.createRef<HTMLDivElement>(),
    };
    render(
      <Card ref={refs.card} className="c-card">
        <CardHeader ref={refs.header} className="c-header">
          <CardTitle ref={refs.title}>Title</CardTitle>
          <CardDescription ref={refs.description}>Description</CardDescription>
        </CardHeader>
        <CardContent ref={refs.content}>Body</CardContent>
        <CardFooter ref={refs.footer}>Footer</CardFooter>
      </Card>,
    );
    for (const [name, text] of [
      ['title', 'Title'],
      ['description', 'Description'],
      ['content', 'Body'],
      ['footer', 'Footer'],
    ] as const) {
      expect(refs[name].current).toHaveTextContent(text);
      expect(screen.getByText(text)).toBe(refs[name].current);
    }
    expect(refs.card.current).toHaveClass('c-card');
    expect(refs.header.current).toHaveClass('c-header');
  });
});
