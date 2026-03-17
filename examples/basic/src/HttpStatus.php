<?php
namespace App\Components;

/**
 * Demonstrates an int-backed enum with computed properties and
 * multiple methods, including one with parameters.
 */
enum HttpStatus: int {
    case Ok = 200;
    case Created = 201;
    case BadRequest = 400;
    case NotFound = 404;
    case ServerError = 500;

    public function badge(): string {
        $color = match (true) {
            $this->value >= 500 => '#ef4444',
            $this->value >= 400 => '#f59e0b',
            $this->value >= 200 && $this->value < 300 => '#22c55e',
            default => '#6b7280',
        };
        return "<span class=\"http-status\" style=\"display: inline-block; padding: 4px 12px; border-radius: 12px; background: {$color}; color: white; font-size: 13px; font-weight: bold;\">{$this->value} {$this->name}</span>";
    }

    public function page(string $message = ''): string {
        $msg = $message !== '' ? $message : match ($this) {
            self::Ok => 'The request was successful.',
            self::Created => 'Resource was created successfully.',
            self::BadRequest => 'The request could not be understood.',
            self::NotFound => 'The requested resource was not found.',
            self::ServerError => 'An internal server error occurred.',
        };
        return "<div class=\"http-status-page\" style=\"padding: 24px; text-align: center;\"><h1 style=\"font-size: 48px; margin: 0;\">{$this->value}</h1><h2 style=\"margin: 8px 0; color: #6b7280;\">{$this->name}</h2><p style=\"color: #9ca3af;\">{$msg}</p></div>";
    }
}
