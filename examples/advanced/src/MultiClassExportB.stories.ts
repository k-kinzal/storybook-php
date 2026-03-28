import type { Meta, StoryObj } from "storybook-php";
import { MultiClassExportB } from "./MultiClassExport.php@render";

const meta: Meta<typeof MultiClassExportB> = {
  component: MultiClassExportB,
  title: "Patterns/MultiClassExport/B",
  argTypes: {
    label: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof MultiClassExportB>;

export const Default: Story = {
  args: { label: "Component B" },
};
