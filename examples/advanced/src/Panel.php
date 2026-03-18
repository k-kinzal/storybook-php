<?php
namespace App\Components;

/**
 * Demonstrates interface implementation with a concrete class.
 * The interface and implementation are in the same file.
 */
interface Renderable {
    public function render(): string;
}

interface HasTitle {
    public function title(): string;
}

class Panel implements Renderable, HasTitle {
    public function __construct(
        private string $heading,
        private string $body = '',
        private bool $collapsible = false,
        private bool $collapsed = false,
    ) {}

    public function title(): string {
        return $this->heading;
    }

    public function render(): string {
        $toggle = $this->collapsible
            ? '<span style="cursor: pointer; margin-left: 8px; font-size: 12px;">' . ($this->collapsed ? '&#9654;' : '&#9660;') . '</span>'
            : '';
        $bodyStyle = $this->collapsed ? 'display: none;' : '';
        $body = $this->body !== ''
            ? "<div style=\"padding: 12px 16px; {$bodyStyle}\">{$this->body}</div>"
            : '';
        return <<<HTML
        <div class="panel" style="border: 1px solid #e5e7eb; border-radius: 8px; font-family: system-ui; overflow: hidden;">
            <div class="panel-header" style="padding: 12px 16px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; font-weight: 600;">{$this->heading}{$toggle}</div>
            {$body}
        </div>
        HTML;
    }
}
