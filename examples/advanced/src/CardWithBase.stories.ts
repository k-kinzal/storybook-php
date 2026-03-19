import type { Meta, StoryObj } from "storybook-php";
import { CardWithBase } from "./CardWithBase.php@render";

const meta: Meta<typeof CardWithBase> = {
  component: CardWithBase,
  title: "Components/CardWithBase",
  argTypes: {
    title: { control: "text" },
    content: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof CardWithBase>;

export const Default: Story = {
  args: { title: "My Card", content: "<h3>My Card</h3><p>Inherited render method</p>" },
};
