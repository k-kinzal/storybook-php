import type { Meta, StoryObj } from 'storybook-php';
import { SeverityEnum } from './SeverityEnum.php@all';

const meta: Meta<typeof SeverityEnum> = {
  component: SeverityEnum,
  title: 'Enums/SeverityAll',
};

export default meta;
type Story = StoryObj<typeof SeverityEnum>;

export const Default: Story = {
  args: { separator: ' ' },
};
