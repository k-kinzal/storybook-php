import type { Meta, StoryObj } from "storybook-php";
import { AccordionPanel } from "./TraitAccordion.php@toggle";

const meta: Meta<typeof AccordionPanel> = {
  component: AccordionPanel,
  title: "Patterns/TraitAccordion",
  argTypes: {
    label: { control: "text" },
    content: { control: "text" },
    open: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof AccordionPanel>;

export const Closed: Story = {
  args: { label: "Click to expand", content: "This content is revealed on toggle.", open: false },
};

export const Open: Story = {
  args: { label: "Already open", content: "This panel starts expanded.", open: true },
};
