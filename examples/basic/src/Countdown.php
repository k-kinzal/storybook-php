<?php
namespace App\Components;

/**
 * Demonstrates void return with echo output
 * and complex conditional rendering.
 */
class Countdown {
    public function __construct(
        private int $from = 10,
        private string $finishMessage = 'Done!',
        private bool $showZero = true,
    ) {}

    public function render(): void {
        echo '<div class="countdown">';
        for ($i = $this->from; $i >= ($this->showZero ? 0 : 1); $i--) {
            $size = 12 + ($this->from - $i) * 2;
            $opacity = max(0.3, $i / $this->from);
            echo "<span class=\"countdown-num\" style=\"display: inline-block; font-size: {$size}px; opacity: {$opacity}; margin: 0 4px;\">{$i}</span>";
        }
        echo "<span class=\"countdown-finish\" style=\"display: block; margin-top: 8px; font-weight: bold; color: #22c55e;\">{$this->finishMessage}</span>";
        echo '</div>';
    }
}
