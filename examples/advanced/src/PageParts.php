<?php
namespace App\Components;

/**
 * Multiple classes in a single file, each independently importable.
 */
class PageHeader {
    public function __construct(
        private string $title,
        private string $subtitle = '',
        private bool $sticky = false,
    ) {}

    public function render(): string {
        $style = 'padding: 16px 24px; background: #1f2937; color: white;';
        if ($this->sticky) {
            $style .= ' position: sticky; top: 0; z-index: 10;';
        }
        $sub = $this->subtitle ? "<p style=\"margin: 4px 0 0; opacity: 0.7; font-size: 14px;\">{$this->subtitle}</p>" : '';
        return "<header style=\"{$style}\"><h1 style=\"margin: 0; font-size: 20px;\">{$this->title}</h1>{$sub}</header>";
    }
}

class PageFooter {
    public function __construct(
        private string $copyright,
        private int $year = 2024,
        private bool $showLinks = true,
    ) {}

    public function render(): string {
        $links = $this->showLinks
            ? '<nav style="margin-top: 8px;"><a href="#" style="color: #9ca3af; margin-right: 16px; text-decoration: none; font-size: 13px;">Privacy</a><a href="#" style="color: #9ca3af; margin-right: 16px; text-decoration: none; font-size: 13px;">Terms</a><a href="#" style="color: #9ca3af; text-decoration: none; font-size: 13px;">Contact</a></nav>'
            : '';
        return "<footer style=\"padding: 16px 24px; background: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;\"><p style=\"margin: 0; color: #6b7280; font-size: 13px;\">&copy; {$this->year} {$this->copyright}</p>{$links}</footer>";
    }
}
