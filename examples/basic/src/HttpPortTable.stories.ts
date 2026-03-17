import type { Meta, StoryObj } from 'storybook-php';
import { HttpPort } from './HttpPort.php@table';

const meta: Meta<typeof HttpPort> = {
  component: HttpPort,
  title: 'Enums/HttpPortTable',
};

export default meta;
type Story = StoryObj<typeof HttpPort>;

export const AllPorts: Story = {
  args: {},
};
