<?php
namespace App\Components;

/**
 * Demonstrates a fluent builder pattern with self-return methods
 * and __toString for final HTML output. The runner converts the
 * returned object to string via __toString.
 */
class SelfChain {
    private array $items = [];
    private string $separator = '';

    public function __construct(
        private string $tag = 'div',
        private string $className = '',
    ) {}

    public function addItem(string $text): self {
        $this->items[] = $text;
        return $this;
    }

    public function render(string $content, string $style = ''): string {
        $cls = $this->className !== '' ? " class=\"{$this->className}\"" : '';
        $styleAttr = $style !== '' ? " style=\"{$style}\"" : '';
        return "<{$this->tag}{$cls}{$styleAttr}>{$content}</{$this->tag}>";
    }

    public function __toString(): string {
        $content = implode($this->separator, $this->items);
        return $this->render($content);
    }
}
