<?php
namespace App\Components;

/**
 * Demonstrates a unit enum with multiple methods and computed properties.
 */
enum HttpMethod {
    case GET;
    case POST;
    case PUT;
    case PATCH;
    case DELETE;

    public function badge(): string {
        $color = match ($this) {
            self::GET    => '#22c55e',
            self::POST   => '#3b82f6',
            self::PUT    => '#f59e0b',
            self::PATCH  => '#8b5cf6',
            self::DELETE => '#ef4444',
        };
        return "<span class=\"http-method http-method-{$this->name}\" style=\"display: inline-block; padding: 2px 10px; border-radius: 4px; background-color: {$color}; color: white; font-family: system-ui; font-size: 13px; font-weight: bold;\">{$this->name}</span>";
    }

    public function endpoint(string $path, string $description = ''): string {
        $desc = $description !== '' ? "<span class=\"endpoint-desc\" style=\"color: #6b7280; margin-left: 12px;\">{$description}</span>" : '';
        return "<div class=\"endpoint\" style=\"display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-family: system-ui;\">{$this->badge()}<code style=\"flex: 1;\">{$path}</code>{$desc}</div>";
    }
}
