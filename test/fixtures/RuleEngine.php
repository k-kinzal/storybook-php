<?php
namespace App\Components;

class RuleEngine {
    public function __construct(
        private string $name = 'Validator',
        private string $variant = 'info',
    ) {}

    public function __invoke(string $rule, string $value, bool $passed = true): string {
        $icon = $passed ? '✓' : '✗';
        return "<div class=\"rule rule-{$this->variant}\">{$icon} {$this->name}: {$rule} = {$value}</div>";
    }
}
