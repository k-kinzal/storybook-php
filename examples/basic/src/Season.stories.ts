import type { Meta, StoryObj } from "storybook-php";
import { Season } from "./Season.php@render";

const meta: Meta<typeof Season> = {
  component: Season,
  title: "Enums/Season",
  argTypes: {
    _case: { control: "select", options: ["Spring", "Summer", "Autumn", "Winter"] },
    description: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Season>;

export const Spring: Story = {
  args: { _case: "Spring", description: "Flowers are blooming" },
};

export const Summer: Story = {
  args: { _case: "Summer", description: "Time for the beach" },
};

export const Winter: Story = {
  args: { _case: "Winter", description: "Snow is falling" },
};
