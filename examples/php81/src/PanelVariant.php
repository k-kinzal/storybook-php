<?php
namespace App\Components;

/**
 * Demonstrates an abstract base class with multiple concrete children.
 * Each child overrides the render() method with a different visual style.
 * Tests vite plugin multi-export from inherited methods.
 */
abstract class AbstractPanel {
    public function __construct(
        protected string $title,
        protected string $content = '',
    ) {}

    abstract public function render(): string;

    protected function baseStyle(): string {
        return 'padding: 16px; border-radius: 8px; font-family: system-ui; margin: 0;';
    }
}

class InfoPanel extends AbstractPanel {
    public function render(): string {
        return <<<HTML
        <div class="panel panel-info" style="{$this->baseStyle()} background: #eff6ff; border: 1px solid #bfdbfe;">
            <h4 style="margin: 0 0 8px; color: #1e40af;">&#8505; {$this->title}</h4>
            <p style="margin: 0; color: #1e3a8a;">{$this->content}</p>
        </div>
        HTML;
    }
}

class WarningPanel extends AbstractPanel {
    public function __construct(
        string $title,
        string $content = '',
        protected string $icon = '&#9888;',
    ) {
        parent::__construct($title, $content);
    }

    public function render(): string {
        return <<<HTML
        <div class="panel panel-warning" style="{$this->baseStyle()} background: #fffbeb; border: 1px solid #fde68a;">
            <h4 style="margin: 0 0 8px; color: #92400e;">{$this->icon} {$this->title}</h4>
            <p style="margin: 0; color: #78350f;">{$this->content}</p>
        </div>
        HTML;
    }
}

class ErrorPanel extends AbstractPanel {
    public function __construct(
        string $title,
        string $content = '',
        protected string $code = '',
    ) {
        parent::__construct($title, $content);
    }

    public function render(): string {
        $codeBlock = $this->code !== ''
            ? "<pre style=\"margin: 8px 0 0; padding: 8px; background: #fef2f2; border-radius: 4px; font-size: 12px; color: #991b1b;\">{$this->code}</pre>"
            : '';
        return <<<HTML
        <div class="panel panel-error" style="{$this->baseStyle()} background: #fef2f2; border: 1px solid #fecaca;">
            <h4 style="margin: 0 0 8px; color: #991b1b;">&#10060; {$this->title}</h4>
            <p style="margin: 0; color: #7f1d1d;">{$this->content}</p>
            {$codeBlock}
        </div>
        HTML;
    }
}
