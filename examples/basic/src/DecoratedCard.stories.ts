import type { Meta, StoryObj } from 'storybook-php';
import { Card } from './Card.php@render';

/**
 * Demonstrates decorator support. Decorators wrap the PHP-rendered
 * output with additional HTML, useful for adding layout containers,
 * theme wrappers, or padding around components.
 */
const meta: Meta<typeof Card> = {
  component: Card,
  title: 'Patterns/DecoratedCard',
  decorators: [
    (storyFn) =>
      `<div style="padding: 24px; background: #f9fafb; border: 2px dashed #d1d5db; border-radius: 12px;">
        <p style="margin: 0 0 12px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Decorator wrapper</p>
        ${storyFn()}
      </div>`,
  ],
  argTypes: {
    title: { control: 'text' },
    body: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const WithWrapper: Story = {
  args: { title: 'Decorated', body: 'This card is wrapped by a meta-level decorator.' },
};

export const WithStoryDecorator: Story = {
  args: { title: 'Double Decorated', body: 'Wrapped by both meta and story decorators.' },
  decorators: [
    (storyFn) =>
      `<div style="padding: 16px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px;">
        <p style="margin: 0 0 8px; font-size: 11px; color: #3b82f6;">Story-level decorator</p>
        ${storyFn()}
      </div>`,
  ],
};
