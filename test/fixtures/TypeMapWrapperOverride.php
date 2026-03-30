<?php

namespace App\Components;

interface WrappedRenderable
{
    public function toHtml(): string;
}

interface WrappedListContract
{
    /** @return list<WrappedRenderable> */
    public function items(): array;
}

class WrappedHtmlBlock implements WrappedRenderable
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

class WrappedList implements WrappedListContract
{
    /** @param list<WrappedRenderable> $items */
    public function __construct(
        private array $items,
    ) {}

    /** @return list<WrappedRenderable> */
    public function items(): array
    {
        return $this->items;
    }
}

class WrappedListRenderer
{
    public function __construct(
        private $items,
    ) {}

    public function render(): string
    {
        $html = '';
        foreach ($this->items->items() as $item) {
            $html .= $item->toHtml();
        }

        return "<section>{$html}</section>";
    }
}
