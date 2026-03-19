import type { Meta, StoryObj } from "storybook-php";
import { Modal } from "./Modal.php@overlay";

const meta: Meta<typeof Modal> = {
  component: Modal,
  title: "Components/Modal/Overlay",
  argTypes: {
    content: { control: "text" },
    opacity: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  args: { title: "Modal", content: "<div>Overlay content</div>" },
};

export const Dark: Story = {
  args: { title: "Modal", content: "<div>Dark overlay</div>", opacity: "0.8" },
};

export const Light: Story = {
  args: { title: "Modal", content: "<div>Light overlay</div>", opacity: "0.2" },
};
