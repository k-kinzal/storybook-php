import type { Meta, StoryObj } from "storybook-php";
import template from "./recipe.php";

const meta: Meta<typeof template> = {
  component: template,
  title: "Templates/Recipe",
};

export default meta;
type Story = StoryObj<typeof template>;

export const Pancakes: Story = {
  args: {
    title: "Classic Pancakes",
    servings: 4,
    ingredients: [
      "2 cups flour",
      "2 eggs",
      "1 cup milk",
      "2 tbsp sugar",
      "1 tsp baking powder",
      "Pinch of salt",
    ],
    steps: [
      "Mix dry ingredients in a large bowl.",
      "Whisk eggs and milk together, then add to dry mix.",
      "Heat a non-stick pan over medium heat.",
      "Pour batter and cook until bubbles form, then flip.",
      "Serve warm with butter and syrup.",
    ],
    notes: "For fluffier pancakes, let the batter rest for 10 minutes.",
  },
};

export const Minimal: Story = {
  args: {
    title: "Quick Toast",
    servings: 1,
    ingredients: ["Bread", "Butter"],
    steps: ["Toast the bread.", "Spread butter."],
  },
};

export const Empty: Story = {
  args: {
    title: "Recipe Placeholder",
    servings: 2,
  },
};
