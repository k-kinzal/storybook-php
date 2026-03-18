<?php
namespace App\Components;

/**
 * Demonstrates the Template Method pattern implemented via a trait.
 * The trait provides a render() method that delegates to abstract hooks.
 * The concrete class implements the hooks to complete the template.
 */
trait HasSection {
    abstract protected function heading(): string;
    abstract protected function body(): string;

    protected function footer(): string {
        return '';
    }

    public function render(): string {
        $footer = $this->footer();
        $footerHtml = $footer !== ''
            ? "<footer style=\"padding: 10px 16px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 13px;\">{$footer}</footer>"
            : '';

        return "<section class=\"section-card\" style=\"border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; font-family: system-ui;\">
            <div style=\"padding: 12px 16px; background: #f9fafb; border-bottom: 1px solid #e5e7eb;\"><h3 style=\"margin: 0; font-size: 16px;\">{$this->heading()}</h3></div>
            <div style=\"padding: 16px;\">{$this->body()}</div>
            {$footerHtml}
        </section>";
    }
}

class InfoSection {
    use HasSection;

    public function __construct(
        private string $title,
        private string $content,
        private ?string $note = null,
    ) {}

    protected function heading(): string {
        return $this->title;
    }

    protected function body(): string {
        return "<p style=\"margin: 0; color: #374151; line-height: 1.5;\">{$this->content}</p>";
    }

    protected function footer(): string {
        return $this->note ?? '';
    }
}
