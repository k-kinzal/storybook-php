<?php
namespace App\Components;

/**
 * Demonstrates a full 4-level hierarchy: Interface + Trait + Abstract + Concrete class.
 * Tests complex method resolution through trait → abstract → concrete chains.
 */
interface Displayable {
    public function display(): string;
}

trait HasContainer {
    public function wrap(string $inner, string $padding = '16px'): string {
        return "<div class=\"widget-container\" style=\"padding: {$padding}; border: 1px solid #e5e7eb; border-radius: 8px; font-family: system-ui;\">{$inner}</div>";
    }
}

abstract class BaseElement {
    use HasContainer;

    public function __construct(
        protected string $title,
        protected string $variant = 'default',
    ) {}

    abstract protected function body(): string;

    protected function variantColor(): string {
        return match ($this->variant) {
            'primary' => '#3b82f6',
            'success' => '#22c55e',
            'danger'  => '#ef4444',
            default   => '#6b7280',
        };
    }
}

class ConcreteWidget extends BaseElement implements Displayable {
    public function __construct(
        string $title,
        string $variant = 'default',
        private string $content = '',
        private string $icon = '',
    ) {
        parent::__construct($title, $variant);
    }

    protected function body(): string {
        $iconHtml = $this->icon !== ''
            ? "<span style=\"margin-right: 8px;\">{$this->icon}</span>"
            : '';
        return "<p style=\"margin: 0; color: #374151; font-size: 14px;\">{$iconHtml}{$this->content}</p>";
    }

    public function display(): string {
        $color = $this->variantColor();
        $header = "<h3 style=\"margin: 0 0 12px; font-size: 16px; color: {$color};\">{$this->title}</h3>";
        return $this->wrap($header . $this->body());
    }

    public function render(): string {
        return $this->display();
    }
}
