import type { Meta, StoryObj } from "storybook-php";
import { StyledBox } from "./NewDefaults.php@render";

const meta: Meta<typeof StyledBox> = {
  component: StyledBox,
  title: "Patterns/NewDefaults",
  argTypes: {
    title: { control: "text" },
    content: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof StyledBox>;

export const Default: Story = {
  args: { title: "Information", content: "Uses default BoxOptions via new BoxOptions()." },
};

export const TitleOnly: Story = {
  args: { title: "Notice" },
};
