<?php
namespace App\Components;

interface StepRenderer {
    public function renderStep(int $step, string $label, bool $active): string;
}

class Stepper implements StepRenderer {
    public function __construct(
        private int $current = 1,
        private array $steps = [],
    ) {}

    public function renderStep(int $step, string $label, bool $active): string {
        $cls = $active ? 'step-active' : 'step-inactive';
        return "<span class=\"step {$cls}\">{$step}. {$label}</span>";
    }

    public function render(): string {
        if (empty($this->steps)) {
            return '<div class="stepper-empty">No steps</div>';
        }
        $items = [];
        foreach ($this->steps as $i => $label) {
            $items[] = $this->renderStep($i + 1, $label, ($i + 1) <= $this->current);
        }
        return '<div class="stepper">' . implode(' ', $items) . '</div>';
    }
}
