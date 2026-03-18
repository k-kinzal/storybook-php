<?php
namespace App\Components;

/**
 * Demonstrates a class whose constructor takes multiple enum-typed parameters.
 * The runner auto-resolves string args to enum cases via ::from().
 */
enum Phase: string {
    case Draft = 'draft';
    case Review = 'review';
    case Approved = 'approved';
    case Published = 'published';
    case Archived = 'archived';
}

class EnumTransition {
    public function __construct(
        private Phase $from,
        private Phase $to,
        private string $label = '',
    ) {}

    public function render(): string
    {
        $order = ['draft' => 0, 'review' => 1, 'approved' => 2, 'published' => 3, 'archived' => 4];
        $fromIdx = $order[$this->from->value] ?? 0;
        $toIdx = $order[$this->to->value] ?? 0;
        $direction = $toIdx > $fromIdx ? 'forward' : ($toIdx < $fromIdx ? 'backward' : 'same');

        $colors = [
            'draft'     => ['bg' => '#f3f4f6', 'text' => '#6b7280'],
            'review'    => ['bg' => '#fef3c7', 'text' => '#92400e'],
            'approved'  => ['bg' => '#dbeafe', 'text' => '#1e40af'],
            'published' => ['bg' => '#dcfce7', 'text' => '#166534'],
            'archived'  => ['bg' => '#f3e8ff', 'text' => '#6b21a8'],
        ];

        $fc = $colors[$this->from->value];
        $tc = $colors[$this->to->value];

        $arrow = match ($direction) {
            'forward'  => '&#8594;',
            'backward' => '&#8592;',
            default    => '&#8596;',
        };

        $arrowColor = match ($direction) {
            'forward'  => '#22c55e',
            'backward' => '#ef4444',
            default    => '#6b7280',
        };

        $labelHtml = $this->label !== ''
            ? "<div style=\"font-size: 11px; color: #9ca3af; margin-top: 4px;\">{$this->label}</div>"
            : '';

        return <<<HTML
        <div class="enum-transition" style="display: flex; align-items: center; gap: 12px; font-family: system-ui;">
            <span style="background: {$fc['bg']}; color: {$fc['text']}; padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 600;">{$this->from->name}</span>
            <span style="font-size: 20px; color: {$arrowColor};">{$arrow}</span>
            <span style="background: {$tc['bg']}; color: {$tc['text']}; padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 600;">{$this->to->name}</span>
            {$labelHtml}
        </div>
        HTML;
    }
}
