import type { Meta, StoryObj } from "storybook-php";
import { Pagination } from "./Pagination.php@render";

const meta: Meta<typeof Pagination> = {
  component: Pagination,
  title: "Components/Pagination",
  argTypes: {
    total: { control: { type: "number", min: 1, max: 500 } },
    perPage: { control: { type: "number", min: 5, max: 50 } },
    current: { control: { type: "number", min: 1, max: 50 } },
  },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  args: { total: 50 },
};

export const MiddlePage: Story = {
  args: { total: 100, perPage: 10, current: 5 },
};

export const LastPage: Story = {
  args: { total: 30, perPage: 10, current: 3 },
};

export const LargeDataset: Story = {
  args: { total: 200, perPage: 20, current: 3 },
};
