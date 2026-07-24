import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Card, CardContent, CardHeader, CardTitle } from '@oc-tech/omni-ui-components/Card';

describe('omni-ui-components/Card', () => {
  it('renders card sections', () => {
    render(<Card><CardHeader><CardTitle>Summary</CardTitle></CardHeader><CardContent>Body</CardContent></Card>);
    expect(screen.getByText('Summary')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
  });
});
