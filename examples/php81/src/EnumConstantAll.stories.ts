import type { Meta, StoryObj } from 'storybook-php';
import { EnumConstant } from './EnumConstant.php@all';

const meta: Meta<typeof EnumConstant> = {
  component: EnumConstant,
  title: 'Enums/EnumConstantAll',
  argTypes: {
    separator: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof EnumConstant>;

export const Default: Story = {
  args: { separator: ' ' },
};

export const WithPipe: Story = {
  args: { separator: ' | ' },
};
