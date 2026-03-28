<?php
namespace App\Components;

class Progress {
    public function __construct(
        private int|string $value,
        private int $max = 100,
        private string $label = '',
    ) {}

    public function render(): string {
        $raw = is_string($this->value) ? intval($this->value) : $this->value;
        $percentage = min(100, max(0, (int) round($raw / $this->max * 100)));
        $text = $this->label !== '' ? htmlspecialchars($this->label) : "{$percentage}%";
        return <<<HTML
        <div class="progress" style="width: 100%; background: #e5e7eb; border-radius: 8px; overflow: hidden;">
            <div class="progress-bar" style="width: {$percentage}%; background: #3b82f6; padding: 4px 12px; color: white; font-size: 14px; min-width: 2em; text-align: center;">
                {$text}
            </div>
        </div>
        HTML;
    }
}
