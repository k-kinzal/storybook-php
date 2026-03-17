<?php
namespace App\Components;

/**
 * Demonstrates a unit enum implementing an interface.
 * Unit enums have no backed value — cases are selected by name.
 */
interface Describable {
    public function description(): string;
}

enum Weekday implements Describable {
    case Monday;
    case Tuesday;
    case Wednesday;
    case Thursday;
    case Friday;
    case Saturday;
    case Sunday;

    public function description(): string {
        return match ($this) {
            self::Saturday, self::Sunday => 'Weekend',
            self::Monday => 'Start of the work week',
            self::Friday => 'Almost weekend!',
            default => 'Midweek',
        };
    }

    public function badge(): string {
        $isWeekend = $this === self::Saturday || $this === self::Sunday;
        $bg = $isWeekend ? '#10b981' : '#6366f1';
        $desc = $this->description();
        return <<<HTML
        <div style="display: inline-flex; align-items: center; gap: 8px; font-family: system-ui;">
            <span style="display: inline-block; padding: 4px 14px; border-radius: 12px; background: {$bg}; color: white; font-weight: 600; font-size: 14px;">{$this->name}</span>
            <span style="color: #6b7280; font-size: 13px;">{$desc}</span>
        </div>
        HTML;
    }
}
