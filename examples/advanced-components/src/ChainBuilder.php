<?php
namespace App\Components;

/**
 * Demonstrates `self` and `static` return types in a builder pattern.
 * Tests parser extraction of these special return type keywords.
 */
class ChainBuilder {
    private array $items = [];
    private string $style = '';

    public function __construct(
        private string $tag = 'ul',
        private string $className = 'chain-list',
    ) {}

    public function add(string $item): self {
        $this->items[] = $item;
        return $this;
    }

    public function withStyle(string $style): static {
        $this->style = $style;
        return $this;
    }

    public function render(string $title = ''): string {
        $cls = $this->className !== '' ? " class=\"{$this->className}\"" : '';
        $styleAttr = $this->style !== '' ? " style=\"{$this->style}\"" : ' style="margin: 0; padding-left: 24px; font-family: system-ui;"';
        $header = $title !== '' ? "<h4 style=\"margin: 0 0 8px; color: #374151; font-family: system-ui;\">{$title}</h4>" : '';
        $lis = implode('', array_map(
            fn($i) => "<li style=\"padding: 2px 0;\">{$i}</li>",
            $this->items
        ));
        return "{$header}<{$this->tag}{$cls}{$styleAttr}>{$lis}</{$this->tag}>";
    }
}
