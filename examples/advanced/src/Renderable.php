<?php
namespace App\Components;

/**
 * Demonstrates interface + multiple implementing classes in one file.
 * Both classes export the same `render()` method, showcasing multi-export.
 */
interface RenderableInterface {
    public function render(): string;
}

class InfoBox implements RenderableInterface {
    public function __construct(
        private string $title,
        private string $message,
        private string $icon = 'ℹ️',
    ) {}

    public function render(): string {
        return "<div class=\"info-box\" style=\"display: flex; gap: 12px; padding: 14px 16px; border: 1px solid #bfdbfe; background: #eff6ff; border-radius: 8px;\"><span style=\"font-size: 20px;\">{$this->icon}</span><div><strong style=\"display: block; margin-bottom: 2px;\">{$this->title}</strong><span style=\"color: #1e40af; font-size: 14px;\">{$this->message}</span></div></div>";
    }
}

class WarningBox implements RenderableInterface {
    public function __construct(
        private string $title,
        private string $message,
        private bool $urgent = false,
    ) {}

    public function render(): string {
        $border = $this->urgent ? '2px solid #f59e0b' : '1px solid #fde68a';
        $bg = $this->urgent ? '#fffbeb' : '#fefce8';
        $icon = $this->urgent ? '⚠️' : '💡';
        return "<div class=\"warning-box\" style=\"display: flex; gap: 12px; padding: 14px 16px; border: {$border}; background: {$bg}; border-radius: 8px;\"><span style=\"font-size: 20px;\">{$icon}</span><div><strong style=\"display: block; margin-bottom: 2px;\">{$this->title}</strong><span style=\"color: #92400e; font-size: 14px;\">{$this->message}</span></div></div>";
    }
}
