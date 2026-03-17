<?php
namespace App\Components;

/**
 * Demonstrates an enum with both static and instance methods.
 * Static methods can be imported via @all, instance methods via @badge or @render.
 */
enum EnumStaticInstance: string {
    case Info = 'info';
    case Success = 'success';
    case Warning = 'warning';
    case Error = 'error';

    public function badge(): string {
        $colors = [
            'info'    => '#3b82f6',
            'success' => '#22c55e',
            'warning' => '#f59e0b',
            'error'   => '#ef4444',
        ];
        $color = $colors[$this->value] ?? '#6b7280';
        $label = ucfirst($this->value);

        return "<span class=\"esi-badge esi-badge-{$this->value}\" style=\"display: inline-block; padding: 4px 12px; border-radius: 12px; background: {$color}; color: white; font-size: 13px; font-weight: 600; font-family: system-ui;\">{$label}</span>";
    }

    public function render(string $message): string {
        $colors = [
            'info'    => ['#3b82f6', '#eff6ff'],
            'success' => ['#22c55e', '#f0fdf4'],
            'warning' => ['#f59e0b', '#fffbeb'],
            'error'   => ['#ef4444', '#fef2f2'],
        ];
        [$accent, $bg] = $colors[$this->value] ?? ['#6b7280', '#f9fafb'];
        $label = ucfirst($this->value);

        return <<<HTML
        <div class="esi-alert esi-alert-{$this->value}" style="padding: 12px 16px; border-left: 4px solid {$accent}; background: {$bg}; border-radius: 0 6px 6px 0; font-family: system-ui;">
            <strong style="color: {$accent};">{$label}:</strong>
            <span style="color: #374151; margin-left: 4px;">{$message}</span>
        </div>
        HTML;
    }

    public static function all(): string {
        $html = '<div class="esi-all" style="display: flex; gap: 8px; flex-wrap: wrap;">';
        foreach (self::cases() as $case) {
            $html .= $case->badge();
        }
        $html .= '</div>';
        return $html;
    }
}
