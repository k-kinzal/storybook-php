import type { Meta, StoryObj } from 'storybook-php';
import { FinalConfig } from './FinalConfig.php@render';

const meta: Meta<typeof FinalConfig> = {
  component: FinalConfig,
  title: 'Patterns/FinalConfig',
  argTypes: {
    appName: { control: 'text' },
    version: { control: 'text' },
    environment: { control: 'select', options: ['production', 'staging', 'development'] },
  },
};

export default meta;
type Story = StoryObj<typeof FinalConfig>;

export const Production: Story = {
  args: { appName: 'MyApp', version: '2.1.0', environment: 'production' },
};

export const Staging: Story = {
  args: { appName: 'MyApp', version: '2.2.0-beta', environment: 'staging' },
};

export const Development: Story = {
  args: { appName: 'MyApp', version: '0.0.1-dev', environment: 'development' },
};
