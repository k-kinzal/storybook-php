<?php
namespace App\Fixtures;

class SelfStaticReturn {
    private array $items = [];

    public function __construct(
        private string $tag = 'ul',
        private string $className = '',
    ) {}

    public function add(string $item): self {
        $this->items[] = $item;
        return $this;
    }

    public function merge(array $items): static {
        foreach ($items as $item) {
            $this->items[] = $item;
        }
        return $this;
    }

    public function render(): string {
        $cls = $this->className !== '' ? " class=\"{$this->className}\"" : '';
        $lis = implode('', array_map(fn($i) => "<li>{$i}</li>", $this->items));
        return "<{$this->tag}{$cls}>{$lis}</{$this->tag}>";
    }
}
