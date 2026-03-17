import type { Meta, StoryObj } from 'storybook-php';
import { formatValue } from './FunctionUnionReturn.php@formatValue';

const meta: Meta<typeof formatValue> = {
  component: formatValue,
  title: 'Functions/FormatValue',
  argTypes: {
    value: { control: 'text' },
    format: { control: 'select', options: ['text', 'number'] },
  },
};

export default meta;
type Story = StoryObj<typeof formatValue>;

export const Default: Story = {
  args: { value: 'Hello' },
};

export const AsNumber: Story = {
  args: { value: '42', format: 'number' },
};
