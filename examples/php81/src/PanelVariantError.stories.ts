import type { Meta, StoryObj } from "storybook-php";
import { ErrorPanel } from "./PanelVariant.php@render";

const meta: Meta<typeof ErrorPanel> = {
  component: ErrorPanel,
  title: "Components/PanelVariant/Error",
  argTypes: {
    title: { control: "text" },
    content: { control: "text" },
    code: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof ErrorPanel>;

export const Default: Story = {
  args: { title: "Error", content: "Something went wrong." },
};

export const WithCode: Story = {
  args: {
    title: "TypeError",
    content: "Cannot read property of undefined.",
    code: "const x = obj.foo.bar; // obj.foo is undefined",
  },
};
