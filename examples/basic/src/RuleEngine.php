<?php
namespace App\Components;

/**
 * Demonstrates an invocable class with __invoke method.
 * The constructor sets up state; __invoke renders with additional params.
 */
class RuleEngine {
    public function __construct(
        private string $name = 'Validator',
        private string $variant = 'info',
    ) {}

    public function __invoke(string $rule, string $value, bool $passed = true): string {
        $icon = $passed ? '&#10003;' : '&#10007;';
        $colors = match ($this->variant) {
            'success' => ['#dcfce7', '#166534'],
            'danger'  => ['#fef2f2', '#991b1b'],
            default   => ['#eff6ff', '#1e40af'],
        };
        $statusBg = $passed ? '#dcfce7' : '#fef2f2';
        $statusFg = $passed ? '#166534' : '#991b1b';

        return <<<HTML
        <div style="display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: {$colors[0]}; border-radius: 6px; font-family: system-ui; max-width: 400px;">
            <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: {$statusBg}; color: {$statusFg}; font-size: 14px; font-weight: bold;">{$icon}</span>
            <div style="flex: 1;">
                <div style="font-size: 12px; color: {$colors[1]}; font-weight: 600;">{$this->name}</div>
                <div style="font-size: 13px; color: #374151;"><strong>{$rule}:</strong> {$value}</div>
            </div>
        </div>
        HTML;
    }
}
