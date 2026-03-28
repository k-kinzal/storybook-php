<?php
namespace App\Components;

/**
 * Demonstrates the `static` return type for fluent builder interfaces.
 * Methods return `static` to enable method chaining in subclasses.
 */
class FluentElement {
    private array $classes = [];
    private array $styles = [];

    public function __construct(
        private string $tag = 'div',
        private string $content = '',
    ) {}

    public function addClass(string $class): static {
        $this->classes[] = $class;
        return $this;
    }

    public function addStyle(string $prop, string $value): static {
        $this->styles[] = "{$prop}: {$value}";
        return $this;
    }

    public function render(): string {
        $cls = implode(' ', $this->classes);
        $style = implode('; ', $this->styles);
        $clsAttr = $cls !== '' ? " class=\"{$cls}\"" : '';
        $styleAttr = $style !== '' ? " style=\"{$style}\"" : '';
        return "<{$this->tag}{$clsAttr}{$styleAttr}>{$this->content}</{$this->tag}>";
    }
}
