<?php
namespace App\Components;

/**
 * Demonstrates a method returning non-string scalar values (int, float).
 * The runner's resolveOutput() casts these to string for HTML output.
 */
class ScalarReturn {
    public function __construct(
        private int $current = 0,
        private int $total = 100,
    ) {}

    public function renderPercent(): int {
        if ($this->total === 0) {
            return 0;
        }
        return (int) round(($this->current / $this->total) * 100);
    }

    public function renderRatio(): float {
        if ($this->total === 0) {
            return 0.0;
        }
        return round($this->current / $this->total, 2);
    }

    public function render(): string {
        $pct = $this->renderPercent();
        $ratio = $this->renderRatio();
        $width = max(0, min(100, $pct));
        return <<<HTML
        <div class="scalar-return" style="font-family:system-ui;max-width:300px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                <span style="font-weight:600;color:#111827;">{$pct}%</span>
                <span style="color:#6b7280;font-size:13px;">{$this->current}/{$this->total}</span>
            </div>
            <div style="height:8px;background:#e5e7eb;border-radius:4px;overflow:hidden;">
                <div style="height:100%;width:{$width}%;background:#3b82f6;border-radius:4px;transition:width 0.3s;"></div>
            </div>
            <div style="text-align:center;margin-top:4px;font-size:12px;color:#9ca3af;">ratio: {$ratio}</div>
        </div>
        HTML;
    }
}
