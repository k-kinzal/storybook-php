<?php

namespace App\Components;

/**
 * Page component that takes a Renderable in its constructor.
 * typeMap.bindings maps Renderable → HtmlBlock so the runner
 * knows how to instantiate the interface-typed parameter.
 */
class Page
{
    public function __construct(
        private string $title,
        private Renderable $content,
    ) {}

    public function render(): string
    {
        return "<article style=\"font-family: system-ui; max-width: 480px;\"><h2 style=\"margin: 0 0 12px; font-size: 20px;\">{$this->title}</h2>{$this->content->toHtml()}</article>";
    }
}
