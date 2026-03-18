<?php
namespace App\Components;

/**
 * Demonstrates an enum with workflow/state-machine logic.
 * Each state has transitions, colors, and rendering.
 * Tests complex match expressions and enum-to-enum references.
 */
enum WorkflowState: string {
    case Draft = 'draft';
    case Review = 'review';
    case Approved = 'approved';
    case Published = 'published';
    case Archived = 'archived';

    public function badge(): string {
        $colors = [
            'draft'     => ['#f3f4f6', '#6b7280'],
            'review'    => ['#fef3c7', '#92400e'],
            'approved'  => ['#dbeafe', '#1e40af'],
            'published' => ['#dcfce7', '#166534'],
            'archived'  => ['#f3e8ff', '#6b21a8'],
        ];
        [$bg, $fg] = $colors[$this->value] ?? ['#f3f4f6', '#374151'];
        $icons = ['draft' => '📝', 'review' => '🔍', 'approved' => '✅', 'published' => '🚀', 'archived' => '📦'];
        $icon = $icons[$this->value] ?? '';
        return "<span class=\"wf-badge\" style=\"display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px; border-radius: 6px; background: {$bg}; color: {$fg}; font-size: 13px; font-weight: 600; font-family: system-ui;\">{$icon} {$this->name}</span>";
    }

    public function transitions(): string {
        $next = match ($this) {
            self::Draft     => [self::Review],
            self::Review    => [self::Approved, self::Draft],
            self::Approved  => [self::Published, self::Review],
            self::Published => [self::Archived],
            self::Archived  => [],
        };

        $currentBadge = $this->badge();
        $arrows = '';
        foreach ($next as $state) {
            $arrows .= "<span style=\"margin: 0 4px; color: #9ca3af;\">→</span>" . $state->badge();
        }
        if ($arrows === '') {
            $arrows = "<span style=\"margin-left: 8px; color: #9ca3af; font-style: italic; font-size: 13px;\">No transitions (final state)</span>";
        }

        return <<<HTML
        <div class="wf-transitions" style="display: flex; align-items: center; flex-wrap: wrap; gap: 4px; padding: 12px; font-family: system-ui;">
            {$currentBadge}{$arrows}
        </div>
        HTML;
    }

    public static function diagram(): string {
        $rows = '';
        foreach (self::cases() as $i => $state) {
            $isLast = $state === self::Archived;
            $connector = $isLast ? '' : '<div style="width: 2px; height: 16px; background: #d1d5db; margin-left: 20px;"></div>';
            $rows .= "<div>{$state->badge()}</div>{$connector}";
        }
        return <<<HTML
        <div class="wf-diagram" style="display: flex; flex-direction: column; align-items: flex-start; gap: 0; padding: 16px; font-family: system-ui;">
            {$rows}
        </div>
        HTML;
    }
}
