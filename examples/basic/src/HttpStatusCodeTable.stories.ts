import type { Meta, StoryObj } from 'storybook-php';
import { HttpStatusCode } from './HttpStatusCode.php@table';

const meta: Meta<typeof HttpStatusCode> = {
  component: HttpStatusCode,
  title: 'Enums/HttpStatusCode/Table',
};

export default meta;
type Story = StoryObj<typeof HttpStatusCode>;

export const AllCodes: Story = {};
