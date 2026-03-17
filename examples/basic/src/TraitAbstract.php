<?php
namespace App\Components;

/**
 * Demonstrates a trait with an abstract method (template method pattern).
 * The trait defines the render() structure, and the class provides content().
 */
trait HasLayout {
    abstract protected function content(): string;

    public function render(): string {
        $inner = $this->content();
        return "<div class=\"layout-wrap\" style=\"border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; font-family: system-ui;\">{$inner}</div>";
    }
}

class TraitAbstract {
    use HasLayout;

    public function __construct(
        private string $title,
        private string $body = '',
    ) {}

    protected function content(): string {
        $bodyHtml = $this->body !== ''
            ? "<p style=\"margin: 8px 0 0; color: #6b7280; font-size: 14px;\">{$this->body}</p>"
            : '';
        return "<h3 style=\"margin: 0; color: #111827;\">{$this->title}</h3>{$bodyHtml}";
    }
}
