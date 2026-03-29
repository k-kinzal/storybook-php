<?php

namespace App\Components;

interface VariadicRenderable
{
    public function toHtml(): string;
}

class VariadicHtmlBlock implements VariadicRenderable
{
    public function __construct(
        private string $content,
        private string $tag = 'div',
    ) {}

    public function toHtml(): string
    {
        return "<{$this->tag}>{$this->content}</{$this->tag}>";
    }
}

class VariadicPage
{
    /** @var list<VariadicRenderable> */
    private array $items;

    public function __construct(
        VariadicRenderable ...$items,
    ) {
        $this->items = $items;
    }

    public function render(): string
    {
        return implode('', array_map(
            fn(VariadicRenderable $item) => $item->toHtml(),
            $this->items,
        ));
    }
}
