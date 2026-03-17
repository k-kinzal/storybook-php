<?php
namespace App\Components;

/**
 * Demonstrates a final class with readonly promoted properties.
 * Combines final + readonly modifiers.
 */
final class FinalConfig {
    public function __construct(
        public readonly string $appName,
        public readonly string $version = '1.0.0',
        public readonly string $environment = 'production',
    ) {}

    public function render(): string {
        $envColor = match ($this->environment) {
            'production' => '#22c55e',
            'staging' => '#eab308',
            'development' => '#3b82f6',
            default => '#6b7280',
        };

        return "<div class=\"config-display\" style=\"font-family: system-ui; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;\">
            <div style=\"display: flex; align-items: center; gap: 8px; margin-bottom: 8px;\">
                <strong style=\"font-size: 18px;\">{$this->appName}</strong>
                <span style=\"font-size: 12px; color: #6b7280;\">v{$this->version}</span>
            </div>
            <span style=\"display: inline-block; padding: 2px 10px; border-radius: 4px; background: {$envColor}; color: white; font-size: 12px; font-weight: 600; text-transform: uppercase;\">{$this->environment}</span>
        </div>";
    }
}
