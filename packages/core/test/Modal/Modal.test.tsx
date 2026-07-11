import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Button } from '@omnitech/omni-ui-core/Button';
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle, ModalTrigger } from '@omnitech/omni-ui-core/Modal';

describe('omni-ui-components/Modal', () => {
  it('opens modal content from the trigger', async () => {
    const user = userEvent.setup();

    render(
      <Modal>
        <ModalTrigger asChild>
          <Button>Open modal</Button>
        </ModalTrigger>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Confirm publish</ModalTitle>
            <ModalDescription>Publish this draft to the team.</ModalDescription>
          </ModalHeader>
          <div className="px-6 py-5 text-sm">Body content</div>
          <ModalFooter>
            <Button variant="secondary">Cancel</Button>
            <Button>Publish</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>,
    );

    expect(screen.queryByText('Confirm publish')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Open modal' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Confirm publish')).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });
});
