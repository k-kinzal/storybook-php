import type { Meta, StoryObj } from "storybook-php";
import SearchTemplate from "./search.php";

const meta: Meta<typeof SearchTemplate> = {
  component: SearchTemplate,
  title: "Templates/Search",
  argTypes: {
    query: { control: "text" },
    resultCount: { control: { type: "range", min: 0, max: 10 } },
    category: {
      control: "select",
      options: ["", "Documentation", "Blog", "API Reference", "Tutorials"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof SearchTemplate>;

export const WithResults: Story = {
  args: { query: "storybook php", resultCount: 5, category: "Documentation" },
};

export const Empty: Story = {
  args: { query: "xyznotfound", resultCount: 0 },
};

export const NoQuery: Story = {
  args: {},
};

export const FewResults: Story = {
  args: { query: "enum", resultCount: 2, category: "API Reference" },
};
