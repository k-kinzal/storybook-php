<?php
namespace App\Components;

/**
 * Demonstrates abstract class implementing interface with concrete child.
 * The interface, abstract class, and concrete class are all in the same file.
 * Only the concrete class is exported — abstract classes only expose static methods.
 */
interface Displayable {
    public function display(): string;
}

abstract class BaseWidget implements Displayable {
    public function __construct(
        protected string $title,
        protected string $variant = 'default',
    ) {}

    abstract protected function content(): string;

    public function display(): string {
        $variants = [
            'default' => ['bg' => '#ffffff', 'border' => '#e5e7eb', 'accent' => '#6b7280'],
            'primary' => ['bg' => '#eff6ff', 'border' => '#3b82f6', 'accent' => '#2563eb'],
            'success' => ['bg' => '#f0fdf4', 'border' => '#22c55e', 'accent' => '#16a34a'],
            'danger'  => ['bg' => '#fef2f2', 'border' => '#ef4444', 'accent' => '#dc2626'],
        ];
        $v = $variants[$this->variant] ?? $variants['default'];

        return "<div class=\"widget widget-{$this->variant}\" style=\"background: {$v['bg']}; border: 1px solid {$v['border']}; border-radius: 8px; padding: 16px; font-family: system-ui;\"><h4 style=\"margin: 0 0 8px; color: {$v['accent']};\">{$this->title}</h4>{$this->content()}</div>";
    }

    public static function availableVariants(): string {
        $variants = ['default', 'primary', 'success', 'danger'];
        $badges = array_map(fn($v) => "<span style=\"display: inline-block; padding: 2px 8px; margin: 2px; border-radius: 4px; background: #f3f4f6; font-size: 12px;\">{$v}</span>", $variants);
        return '<div class="variants">' . implode(' ', $badges) . '</div>';
    }
}

class InfoWidget extends BaseWidget {
    public function __construct(
        string $title,
        private string $message = '',
        string $variant = 'default',
    ) {
        parent::__construct($title, $variant);
    }

    protected function content(): string {
        return "<p style=\"margin: 0; color: #374151; font-size: 14px; line-height: 1.5;\">{$this->message}</p>";
    }
}

class CounterWidget extends BaseWidget {
    public function __construct(
        string $title,
        private int $count = 0,
        private int $max = 100,
        string $variant = 'default',
    ) {
        parent::__construct($title, $variant);
    }

    protected function content(): string {
        $pct = $this->max > 0 ? min(100, (int) round(($this->count / $this->max) * 100)) : 0;
        return "<div style=\"margin-top: 4px;\"><div style=\"display: flex; justify-content: space-between; font-size: 13px; color: #6b7280; margin-bottom: 4px;\"><span>{$this->count}/{$this->max}</span><span>{$pct}%</span></div><div style=\"height: 6px; background: #e5e7eb; border-radius: 3px;\"><div style=\"height: 100%; width: {$pct}%; background: #3b82f6; border-radius: 3px;\"></div></div></div>";
    }
}
