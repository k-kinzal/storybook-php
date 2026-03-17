import type { Meta, StoryObj } from 'storybook-php';
import { SeverityEnum } from './SeverityEnum.php@ofLevel';

const meta: Meta<typeof SeverityEnum> = {
  component: SeverityEnum,
  title: 'Enums/SeverityLevel',
  argTypes: {
    level: { control: { type: 'range', min: 0, max: 100 } },
    prefix: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof SeverityEnum>;

export const Low: Story = { args: { level: 20 } };
export const Medium: Story = { args: { level: 50 } };
export const High: Story = { args: { level: 75, prefix: 'Alert:' } };
export const Critical: Story = { args: { level: 95, prefix: 'CRITICAL:' } };
