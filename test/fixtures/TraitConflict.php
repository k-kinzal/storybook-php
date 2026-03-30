<?php
namespace App\Fixtures;

trait HasHtmlRender {
    public function render(string $text): string {
        return "<div class=\"html-render\">{$text}</div>";
    }
}

trait HasMarkdownRender {
    public function render(string $text): string {
        return "<pre class=\"md-render\">{$text}</pre>";
    }
}

class TraitConflict {
    use HasHtmlRender, HasMarkdownRender {
        HasHtmlRender::render insteadof HasMarkdownRender;
        HasMarkdownRender::render as renderMarkdown;
    }

    public function __construct(
        private string $title = 'Content',
    ) {}
}
