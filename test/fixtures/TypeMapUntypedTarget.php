<?php

namespace App\Components;

interface UntypedRenderable
{
    public function toHtml(): string;
}

class UntypedHtmlBlock implements UntypedRenderable
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

class UntypedRenderer
{
    public function __construct(
        private $content,
    ) {}

    public function render(): string
    {
        return '<section>' . $this->content->toHtml() . '</section>';
    }
}
