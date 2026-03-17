<?php
namespace App\Components;

/**
 * Demonstrates the `static` return type for fluent interfaces.
 * The `static` return type enables late static binding in return types.
 */
class StaticReturnType {
    private array $classes = [];
    private string $text = '';

    public function __construct(
        private string $tag = 'div',
    ) {}

    public function addClass(string $class): static {
        $this->classes[] = $class;
        return $this;
    }

    public function setText(string $text): static {
        $this->text = $text;
        return $this;
    }

    public function render(): string {
        $cls = implode(' ', $this->classes);
        return "<{$this->tag} class=\"{$cls}\">{$this->text}</{$this->tag}>";
    }
}
