<?php
namespace App\Components;

/**
 * Demonstrates an int-backed enum with methods.
 * The runner resolves cases via ::from() with integer values.
 */
enum HttpCode: int {
    case Ok = 200;
    case Created = 201;
    case BadRequest = 400;
    case NotFound = 404;
    case ServerError = 500;

    public function badge(): string {
        $color = match (true) {
            $this->value >= 500 => '#991b1b',
            $this->value >= 400 => '#ef4444',
            $this->value >= 300 => '#f59e0b',
            $this->value >= 200 => '#22c55e',
            default => '#6b7280',
        };
        return "<span class=\"http-code\" style=\"display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 6px; background-color: {$color}; color: white; font-size: 13px; font-weight: 600; font-family: monospace;\">{$this->value} {$this->label()}</span>";
    }

    public function label(): string {
        return match ($this) {
            self::Ok => 'OK',
            self::Created => 'Created',
            self::BadRequest => 'Bad Request',
            self::NotFound => 'Not Found',
            self::ServerError => 'Internal Server Error',
        };
    }

    public function page(string $message = ''): string {
        $text = $message !== '' ? htmlspecialchars($message) : "The server returned {$this->value} {$this->label()}.";
        $isError = $this->value >= 400;
        $bg = $isError ? '#fef2f2' : '#f0fdf4';
        $border = $isError ? '#fecaca' : '#bbf7d0';
        return <<<HTML
        <div class="http-page" style="padding: 24px; border: 1px solid {$border}; background: {$bg}; border-radius: 8px; text-align: center; font-family: system-ui; max-width: 400px;">
            <div style="font-size: 48px; font-weight: bold; color: #374151;">{$this->value}</div>
            <div style="font-size: 18px; color: #6b7280; margin: 8px 0;">{$this->label()}</div>
            <p style="color: #4b5563; font-size: 14px;">{$text}</p>
        </div>
        HTML;
    }
}
