import type { Meta, StoryObj } from "storybook-php";
import { ArticleCard } from "./AbstractTraitChild.php@render";

const meta: Meta<typeof ArticleCard> = {
  component: ArticleCard,
  title: "Components/ArticleCard",
};

export default meta;
type Story = StoryObj<typeof ArticleCard>;

export const Default: Story = {
  args: {
    title: "Getting Started",
    excerpt: "Learn the basics of storybook-php.",
    author: "Dev Team",
  },
};

export const NoExcerpt: Story = {
  args: { title: "Quick Update" },
};
