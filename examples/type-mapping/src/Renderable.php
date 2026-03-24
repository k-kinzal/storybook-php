<?php

namespace App\Components;

/**
 * Interface + concrete implementation for demonstrating typeMap.bindings.
 *
 * When a constructor param is typed as Renderable (interface),
 * the runner can't instantiate it. typeMap.bindings tells it
 * to use HtmlBlock as the concrete class.
 */
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
        return "<{$this->tag} style=\"padding: 8px; background: #f9fafb; border-radius: 4px;\">{$this->content}</{$this->tag}>";
    }
}
