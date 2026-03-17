<?php

/**
 * Demonstrates a class without a namespace.
 * The framework supports both namespaced and non-namespaced PHP classes.
 */
class SimpleBox {
    public function __construct(
        private string $content,
        private string $borderColor = '#d1d5db',
        private int $padding = 16,
    ) {}

    public function render(): string {
        return "<div class=\"simple-box\" style=\"padding: {$this->padding}px; border: 2px solid {$this->borderColor}; border-radius: 8px;\">{$this->content}</div>";
    }
}
