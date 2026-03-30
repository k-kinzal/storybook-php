<?php
namespace App\Components;

enum WorkflowState: string {
    case Draft = 'draft';
    case Review = 'review';
    case Approved = 'approved';
    case Published = 'published';
    case Archived = 'archived';

    public function badge(): string {
        return "<span class=\"wf-{$this->value}\">{$this->name}</span>";
    }

    public function transitions(): string {
        $next = match ($this) {
            self::Draft     => [self::Review],
            self::Review    => [self::Approved, self::Draft],
            self::Approved  => [self::Published, self::Review],
            self::Published => [self::Archived],
            self::Archived  => [],
        };
        $labels = array_map(fn($s) => $s->name, $next);
        return "<div>{$this->name} -> " . implode(', ', $labels) . "</div>";
    }

    public static function diagram(): string {
        $html = '<div>';
        foreach (self::cases() as $state) {
            $html .= $state->badge();
        }
        return $html . '</div>';
    }
}
