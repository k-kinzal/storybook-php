import type { Meta, StoryObj } from "storybook-php";
import { Language } from "./Language.php@flag";

const meta: Meta<typeof Language> = {
  component: Language,
  title: "Enums/LanguageFlag",
  argTypes: {
    _case: { control: "select", options: ["en", "ja", "fr", "es", "de"] },
  },
};

export default meta;
type Story = StoryObj<typeof Language>;

export const English: Story = {
  args: { _case: "en" },
};

export const Japanese: Story = {
  args: { _case: "ja" },
};
