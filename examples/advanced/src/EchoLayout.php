<?php

namespace App\Components;

/**
 * Demonstrates a void-return method that uses echo/print.
 * The runner captures output via ob_start()/ob_get_clean().
 */
class EchoLayout {
    public function __construct(
        private string $title,
        private string $theme = 'light',
        private ?string $footer = null,
    ) {}

    public function render(): void
    {
        echo "<div class=\"echo-layout echo-layout-{$this->theme}\">";
        echo "<header class=\"echo-layout-header\"><h1>{$this->title}</h1></header>";
        echo '<main class="echo-layout-main"><slot></slot></main>';
        if ($this->footer !== null) {
            echo "<footer class=\"echo-layout-footer\">{$this->footer}</footer>";
        }
        echo '</div>';
    }
}
