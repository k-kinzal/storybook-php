<?php
namespace App\Components;

trait HasLayout {
    abstract protected function content(): string;

    public function render(): string {
        $inner = $this->content();
        return "<div class=\"layout-wrap\">{$inner}</div>";
    }
}

class TraitAbstract {
    use HasLayout;

    public function __construct(
        private string $title,
        private string $body = '',
    ) {}

    protected function content(): string {
        return "<h3>{$this->title}</h3><p>{$this->body}</p>";
    }
}
