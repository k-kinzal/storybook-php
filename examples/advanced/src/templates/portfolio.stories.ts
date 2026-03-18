import type { Meta, StoryObj } from 'storybook-php';
import PortfolioTemplate from './portfolio.php';

const meta: Meta = {
  component: PortfolioTemplate,
  title: 'Templates/Portfolio',
  argTypes: {
    name: { control: 'text' },
    role: { control: 'text' },
    showContact: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    name: 'Jane Developer',
    role: 'Full-Stack Engineer',
    skills: ['PHP', 'TypeScript', 'React'],
    projects: ['storybook-php', 'Design System', 'REST API'],
    showContact: true,
  },
};

export const MinimalProfile: Story = {
  args: {
    name: 'Alex Kim',
    role: 'Backend Developer',
    skills: ['PHP', 'Laravel', 'MySQL'],
    showContact: false,
  },
};

export const WithProjects: Story = {
  args: {
    name: 'Sam Rivera',
    role: 'Tech Lead',
    skills: ['Architecture', 'PHP', 'Go', 'Kubernetes'],
    projects: ['Microservices Platform', 'CI/CD Pipeline', 'Monitoring Dashboard'],
    showContact: true,
  },
};
