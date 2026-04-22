import type { Meta, StoryObj } from "storybook-php";
import { PhpEnv } from "./PhpEnv.php@render";

const meta: Meta<typeof PhpEnv> = {
  component: PhpEnv,
  title: "Framework/PhpEnv",
  argTypes: {
    envName: { control: "text", description: "Environment variable to read" },
    iniName: { control: "text", description: "php.ini setting to read" },
  },
};

export default meta;
type Story = StoryObj<typeof PhpEnv>;

export const AppEnvFromPhpEnv: Story = {
  args: { envName: "APP_ENV", iniName: "memory_limit" },
};

export const XdebugModeFromPhpEnv: Story = {
  args: { envName: "XDEBUG_MODE", iniName: "memory_limit" },
};
