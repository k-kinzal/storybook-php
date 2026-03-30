<?php

namespace App\Templates;

interface RenderableSnippet
{
    public function toHtml(): string;
}

class HtmlSnippet implements RenderableSnippet
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

class SnippetList
{
    /** @param list<RenderableSnippet> $items */
    public function __construct(
        private array $items,
    ) {}

    /** @return list<RenderableSnippet> */
    public function items(): array
    {
        return $this->items;
    }
}
