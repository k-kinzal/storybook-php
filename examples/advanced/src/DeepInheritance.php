<?php
namespace App\Components;

/**
 * Demonstrates deep inheritance (3 levels).
 * Tests that the parser/runner correctly handle multi-level class hierarchies.
 */
abstract class BaseWidget {
    public function __construct(
        protected string $title = 'Widget',
        protected string $theme = 'light',
    ) {}

    abstract public function render(): string;

    protected function themeStyle(): string {
        return match ($this->theme) {
            'dark' => 'background: #1f2937; color: #f9fafb; border-color: #374151;',
            'accent' => 'background: #eff6ff; color: #1e40af; border-color: #bfdbfe;',
            default => 'background: #ffffff; color: #111827; border-color: #e5e7eb;',
        };
    }
}

class InfoWidget extends BaseWidget {
    public function __construct(
        string $title = 'Info',
        string $theme = 'light',
        protected string $message = '',
    ) {
        parent::__construct($title, $theme);
    }

    public function render(): string {
        return "<div class=\"info-widget\" style=\"padding: 16px; border: 1px solid; border-radius: 8px; font-family: system-ui; {$this->themeStyle()}\"><h4 style=\"margin: 0 0 8px 0;\">{$this->title}</h4><p style=\"margin: 0;\">{$this->message}</p></div>";
    }
}

class DetailWidget extends InfoWidget {
    public function __construct(
        string $title = 'Detail',
        string $theme = 'light',
        string $message = '',
        protected string $footer = '',
    ) {
        parent::__construct($title, $theme, $message);
    }

    public function render(): string {
        $footerHtml = $this->footer ? "<div style=\"margin-top: 12px; padding-top: 8px; border-top: 1px solid; opacity: 0.7; font-size: 13px;\">{$this->footer}</div>" : '';
        return "<div class=\"detail-widget\" style=\"padding: 16px; border: 1px solid; border-radius: 8px; font-family: system-ui; {$this->themeStyle()}\"><h4 style=\"margin: 0 0 8px 0;\">{$this->title}</h4><p style=\"margin: 0;\">{$this->message}</p>{$footerHtml}</div>";
    }
}
