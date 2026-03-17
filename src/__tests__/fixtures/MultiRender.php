<?php
namespace App\Fixtures;

class MultiRender {
    public function __construct(
        private string $title,
        private string $body = '',
    ) {}

    public function render(): string {
        return "<div class=\"card\"><h3>{$this->title}</h3><p>{$this->body}</p></div>";
    }

    public function renderCompact(): string {
        return "<span class=\"compact\">{$this->title}</span>";
    }

    public function renderDetailed(string $footer = ''): string {
        $f = $footer !== '' ? "<footer>{$footer}</footer>" : '';
        return "<article><h2>{$this->title}</h2><div>{$this->body}</div>{$f}</article>";
    }
}
