<?php
namespace App\Fixtures;

class ScalarReturn {
    public function __construct(
        private int $current = 0,
        private int $total = 100,
    ) {}

    public function renderPercent(): int {
        if ($this->total === 0) return 0;
        return (int) round(($this->current / $this->total) * 100);
    }

    public function renderRatio(): float {
        if ($this->total === 0) return 0.0;
        return round($this->current / $this->total, 2);
    }

    public function render(): string {
        return "<div class=\"scalar\">{$this->renderPercent()}% ({$this->current}/{$this->total})</div>";
    }
}
