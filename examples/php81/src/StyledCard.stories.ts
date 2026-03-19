import type { Meta, StoryObj } from "storybook-php";
import { StyledCard } from "./StyledCard.php@render";

const meta: Meta<typeof StyledCard> = {
  component: StyledCard,
  title: "Components/StyledCard",
  argTypes: {
    title: { control: "text" },
    body: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof StyledCard>;

export const Default: Story = {
  args: { title: "Styled Card", body: "Uses a CardStyle object with new ClassName() default." },
};

export const TitleOnly: Story = {
  args: { title: "Minimal Card" },
};
