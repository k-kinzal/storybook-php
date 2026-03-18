<?php
namespace App\Components;

/**
 * Demonstrates an int-backed enum with arithmetic operations on the backing value.
 * The int value is used directly in rendering logic (range checks, display).
 */
enum HttpStatusCode: int {
    case OK = 200;
    case Created = 201;
    case MovedPermanently = 301;
    case NotFound = 404;
    case Forbidden = 403;
    case InternalServerError = 500;
    case BadGateway = 502;
    case ServiceUnavailable = 503;

    public function category(): string {
        return match (true) {
            $this->value >= 200 && $this->value < 300 => 'Success',
            $this->value >= 300 && $this->value < 400 => 'Redirect',
            $this->value >= 400 && $this->value < 500 => 'Client Error',
            $this->value >= 500 => 'Server Error',
            default => 'Unknown',
        };
    }

    public function badge(): string {
        $color = match (true) {
            $this->value >= 500 => '#dc2626',
            $this->value >= 400 => '#f59e0b',
            $this->value >= 300 => '#3b82f6',
            default => '#22c55e',
        };
        $bgColor = match (true) {
            $this->value >= 500 => '#fef2f2',
            $this->value >= 400 => '#fffbeb',
            $this->value >= 300 => '#eff6ff',
            default => '#f0fdf4',
        };

        return <<<HTML
        <div style="display: inline-flex; align-items: center; gap: 10px; padding: 8px 14px; background: {$bgColor}; border: 1px solid {$color}30; border-radius: 8px; font-family: monospace;">
            <span style="font-size: 18px; font-weight: 700; color: {$color};">{$this->value}</span>
            <div>
                <div style="font-size: 13px; font-weight: 600; color: #111827;">{$this->name}</div>
                <div style="font-size: 11px; color: #6b7280;">{$this->category()}</div>
            </div>
        </div>
        HTML;
    }

    public static function table(): string {
        $rows = '';
        foreach (self::cases() as $case) {
            $color = match (true) {
                $case->value >= 500 => '#dc2626',
                $case->value >= 400 => '#f59e0b',
                $case->value >= 300 => '#3b82f6',
                default => '#22c55e',
            };
            $rows .= "<tr><td style=\"padding: 6px 12px; font-weight: 600; color: {$color};\">{$case->value}</td><td style=\"padding: 6px 12px;\">{$case->name}</td><td style=\"padding: 6px 12px; color: #6b7280;\">{$case->category()}</td></tr>";
        }
        return "<table style=\"border-collapse: collapse; font-family: system-ui; font-size: 13px;\"><thead><tr style=\"border-bottom: 2px solid #e5e7eb;\"><th style=\"padding: 6px 12px; text-align: left;\">Code</th><th style=\"padding: 6px 12px; text-align: left;\">Name</th><th style=\"padding: 6px 12px; text-align: left;\">Category</th></tr></thead><tbody>{$rows}</tbody></table>";
    }
}
