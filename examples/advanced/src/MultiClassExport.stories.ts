import type { Meta, StoryObj } from "storybook-php";
import { MultiClassExportA } from "./MultiClassExport.php@render";

const meta: Meta<typeof MultiClassExportA> = {
  component: MultiClassExportA,
  title: "Patterns/MultiClassExport/A",
  argTypes: {
    label: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof MultiClassExportA>;

export const Default: Story = {
  args: { label: "Component A" },
};
