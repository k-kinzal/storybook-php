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
        $bg = $active ? '#3b82f6' : '#d1d5db';
        $fg = $active ? 'white' : '#6b7280';
        return "<span class=\"step {$cls}\" style=\"display: inline-flex; align-items: center; gap: 4px;\"><span style=\"background: {$bg}; color: {$fg}; border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; font-size: 12px;\">{$step}</span> {$label}</span>";
    }

    public function render(): string {
        if (empty($this->steps)) {
            return '<div class="stepper stepper-empty">No steps defined</div>';
        }

        $items = [];
        foreach ($this->steps as $i => $label) {
            $stepNum = $i + 1;
            $active = $stepNum <= $this->current;
            $items[] = $this->renderStep($stepNum, $label, $active);
        }

        $sep = ' <span style="color: #d1d5db; margin: 0 8px;">&#8594;</span> ';
        return '<div class="stepper" style="display: flex; align-items: center;">' . implode($sep, $items) . '</div>';
    }
}
