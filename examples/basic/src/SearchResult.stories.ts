import type { Meta, StoryObj } from 'storybook-php';
import { SearchResult } from './SearchResult.php@render';

const meta: Meta<typeof SearchResult> = {
  component: SearchResult,
  title: 'Components/SearchResult',
  argTypes: {
    haystack: { control: 'text', description: 'Text to search in' },
    needle: { control: 'text', description: 'Text to search for' },
  },
};

export default meta;
type Story = StoryObj<typeof SearchResult>;

export const Found: Story = {
  args: { haystack: 'Hello world, welcome!', needle: 'world' },
};

export const NotFound: Story = {
  args: { haystack: 'Hello world', needle: 'missing' },
};

export const PartialMatch: Story = {
  args: { haystack: 'The quick brown fox', needle: 'quick' },
};
