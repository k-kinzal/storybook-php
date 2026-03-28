<?php
namespace App\Components;

/**
 * Demonstrates 3-level deep class inheritance.
 * BaseElement -> StyledElement -> InteractiveButton
 * Constructor params are resolved through the parent chain.
 */
abstract class BaseElement {
    public function __construct(
        protected string $text,
        protected string $tag = 'div',
    ) {}

    abstract public function render(): string;
}

class StyledElement extends BaseElement {
    public function __construct(
        string $text,
        string $tag = 'div',
        protected string $color = '#374151',
        protected string $background = 'transparent',
    ) {
        parent::__construct($text, $tag);
    }

    public function render(): string {
        return "<{$this->tag} style=\"color: {$this->color}; background: {$this->background}; padding: 8px 14px; font-family: system-ui;\">{$this->text}</{$this->tag}>";
    }
}

class InteractiveButton extends StyledElement {
    public function __construct(
        string $text,
        string $color = 'white',
        string $background = '#3b82f6',
        private string $size = 'md',
        private bool $disabled = false,
    ) {
        parent::__construct($text, 'button', $color, $background);
    }

    public function render(): string {
        $padding = match ($this->size) {
            'sm' => '6px 12px',
            'lg' => '12px 24px',
            default => '8px 16px',
        };
        $fontSize = match ($this->size) {
            'sm' => '12px',
            'lg' => '16px',
            default => '14px',
        };
        $opacity = $this->disabled ? '0.5' : '1';
        $cursor = $this->disabled ? 'not-allowed' : 'pointer';

        return "<button style=\"color: {$this->color}; background: {$this->background}; padding: {$padding}; font-size: {$fontSize}; font-weight: 600; border: none; border-radius: 6px; cursor: {$cursor}; opacity: {$opacity}; font-family: system-ui;\" " . ($this->disabled ? 'disabled' : '') . ">{$this->text}</button>";
    }
}
