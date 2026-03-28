<?php
namespace App\Components;

/**
 * Complex nested example demonstrating recursive PHPDoc array-of-class casting.
 *
 * Structure (4 levels deep):
 *   ProjectBoard
 *     ├── list<Member>          ← @phpstan-param array casting
 *     │     └── list<Skill>     ← nested array casting inside array element
 *     │           └── SkillLevel (enum)
 *     └── list<Milestone>       ← @phpstan-param array casting
 *           └── list<Task>      ← nested array casting inside array element
 *                 └── TaskStatus (enum)
 */

enum SkillLevel: string {
    case Beginner = 'beginner';
    case Intermediate = 'intermediate';
    case Expert = 'expert';
}

enum TaskStatus: string {
    case Todo = 'todo';
    case InProgress = 'in_progress';
    case Done = 'done';
}

readonly class Skill {
    public function __construct(
        public string $name,
        public SkillLevel $level = SkillLevel::Beginner,
    ) {}
}

readonly class Member {
    /**
     * @phpstan-param list<Skill> $skills
     */
    public function __construct(
        public string $name,
        public string $role,
        public array $skills = [],
    ) {}
}

readonly class Task {
    public function __construct(
        public string $title,
        public TaskStatus $status = TaskStatus::Todo,
        public ?string $assignee = null,
    ) {}
}

readonly class Milestone {
    /**
     * @phpstan-param list<Task> $tasks
     */
    public function __construct(
        public string $name,
        public array $tasks = [],
    ) {}
}

class ProjectBoard {
    /**
     * @phpstan-param list<Member> $members
     * @phpstan-param list<Milestone> $milestones
     */
    public function __construct(
        private string $name,
        private array $members,
        private array $milestones = [],
        private string $description = '',
    ) {}

    public function render(): string
    {
        $memberHtml = '';
        foreach ($this->members as $member) {
            $skillTags = implode('', array_map(
                fn(Skill $s) => "<span class=\"skill skill-{$s->level->value}\">{$s->name}</span>",
                $member->skills,
            ));
            $memberHtml .= "<div class=\"member\">"
                . "<strong>{$member->name}</strong> "
                . "<span class=\"role\">{$member->role}</span>"
                . ($skillTags !== '' ? "<div class=\"skills\">{$skillTags}</div>" : '')
                . "</div>";
        }

        $milestoneHtml = '';
        foreach ($this->milestones as $milestone) {
            $taskItems = '';
            foreach ($milestone->tasks as $task) {
                $assignee = $task->assignee !== null ? " <span class=\"assignee\">({$task->assignee})</span>" : '';
                $taskItems .= "<li class=\"task-{$task->status->value}\">{$task->title}{$assignee}</li>";
            }
            $milestoneHtml .= "<div class=\"milestone\">"
                . "<h4>{$milestone->name}</h4>"
                . "<ul>{$taskItems}</ul>"
                . "</div>";
        }

        $desc = $this->description !== '' ? "<p class=\"description\">{$this->description}</p>" : '';

        return "<div class=\"project-board\">"
            . "<h2>{$this->name}</h2>"
            . $desc
            . "<section class=\"members\"><h3>Team</h3>{$memberHtml}</section>"
            . "<section class=\"milestones\"><h3>Milestones</h3>{$milestoneHtml}</section>"
            . "</div>";
    }
}
