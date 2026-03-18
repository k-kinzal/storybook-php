<?php
namespace App\Components;

/**
 * Demonstrates a class with a private constructor and static factory methods only.
 * The class cannot be instantiated directly — only through named constructors.
 */
class PrivateConstruct {
    private function __construct(
        private string $type,
        private string $message,
        private string $icon,
    ) {}

    public static function success(string $message = 'Operation completed.'): string {
        $self = new self('success', $message, '&#10004;');
        return $self->html();
    }

    public static function error(string $message = 'Something went wrong.'): string {
        $self = new self('error', $message, '&#10006;');
        return $self->html();
    }

    public static function info(string $message = 'For your information.'): string {
        $self = new self('info', $message, '&#8505;');
        return $self->html();
    }

    private function html(): string {
        $colors = [
            'success' => ['bg' => '#f0fdf4', 'border' => '#22c55e', 'text' => '#166534'],
            'error'   => ['bg' => '#fef2f2', 'border' => '#ef4444', 'text' => '#991b1b'],
            'info'    => ['bg' => '#eff6ff', 'border' => '#3b82f6', 'text' => '#1e40af'],
        ];
        $c = $colors[$this->type] ?? $colors['info'];
        return "<div class=\"notice notice-{$this->type}\" style=\"display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: {$c['bg']}; border-left: 4px solid {$c['border']}; color: {$c['text']}; border-radius: 4px; font-family: system-ui; font-size: 14px;\"><span style=\"font-size: 18px;\">{$this->icon}</span><span>{$this->message}</span></div>";
    }
}
