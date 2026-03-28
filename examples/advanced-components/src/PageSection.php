<?php
namespace App\Components;

/**
 * Demonstrates multiple independent classes in one file.
 * Each class can be imported separately as a story target.
 */
class PageHeader {
    public function __construct(
        private string $title,
        private string $logo = 'Acme',
        private bool $sticky = false,
    ) {}

    public function render(): string {
        $stickyStyle = $this->sticky ? 'position: sticky; top: 0; z-index: 100;' : '';
        return <<<HTML
        <header style="display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; background: #1f2937; color: white; {$stickyStyle}">
            <span style="font-weight: bold; font-size: 18px;">{$this->logo}</span>
            <nav style="font-size: 14px;">{$this->title}</nav>
        </header>
        HTML;
    }
}

class PageFooter {
    public function __construct(
        private string $copyright,
        private int $year = 2025,
        private string $theme = 'dark',
    ) {}

    public function render(): string {
        $bg = $this->theme === 'dark' ? '#111827' : '#f9fafb';
        $fg = $this->theme === 'dark' ? '#9ca3af' : '#6b7280';
        return <<<HTML
        <footer style="padding: 16px 24px; background: {$bg}; color: {$fg}; text-align: center; font-size: 13px;">
            &copy; {$this->year} {$this->copyright}. All rights reserved.
        </footer>
        HTML;
    }
}
