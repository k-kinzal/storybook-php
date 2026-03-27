<?php

namespace App\Components;

interface Renderable
{
    public function toHtml(): string;
}

class HtmlBlock implements Renderable
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

class PlainTextBlock implements Renderable
{
    public function __construct(
        private string $content,
        private string $tag = 'span',
    ) {}

    public function toHtml(): string
    {
        return htmlspecialchars($this->content);
    }
}

class PageWithInterface
{
    public function __construct(
        private string $title,
        private Renderable $content,
    ) {}

    public function render(): string
    {
        return "<h1>{$this->title}</h1>" . $this->content->toHtml();
    }
}

class PageWithItems
{
    /**
     * @param list<Renderable> $items
     */
    public function __construct(
        private string $title,
        private array $items,
    ) {}

    public function render(): string
    {
        $html = "<h1>{$this->title}</h1>";
        foreach ($this->items as $item) {
            $html .= $item->toHtml();
        }
        return $html;
    }
}
