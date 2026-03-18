import type { Meta, StoryObj } from 'storybook-php';
import ModalTemplate from './modal.php';

const meta: Meta = {
  component: ModalTemplate,
  title: 'Templates/Modal',
  argTypes: {
    title: { control: 'text' },
    body: { control: 'text' },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    showClose: { control: 'boolean' },
    showFooter: { control: 'boolean' },
    confirmLabel: { control: 'text' },
    cancelLabel: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: { title: 'Confirm Action', body: 'Are you sure you want to proceed with this action?', size: 'medium', showClose: true, showFooter: true },
};

export const Small: Story = {
  args: { title: 'Quick Note', body: 'This is a small dialog.', size: 'small', showClose: true, showFooter: false },
};

export const Large: Story = {
  args: { title: 'Delete Account', body: 'This action is permanent and cannot be undone. All your data will be removed.', size: 'large', confirmLabel: 'Delete', cancelLabel: 'Keep Account' },
};

export const NoClose: Story = {
  args: { title: 'Required Action', body: 'Please complete the required fields.', showClose: false, confirmLabel: 'OK' },
};
