<?php
namespace App\Components;

/**
 * Enum implementing a custom interface with a match-expression method.
 * Demonstrates backed enum with interface, description method, and
 * render method with a boolean parameter.
 */
interface HasDescription {
    public function description(): string;
}

enum Planet: string implements HasDescription {
    case Mercury = 'mercury';
    case Venus = 'venus';
    case Earth = 'earth';
    case Mars = 'mars';

    public function description(): string {
        return match ($this) {
            self::Mercury => 'Closest to the Sun',
            self::Venus => 'Hottest planet',
            self::Earth => 'Our home',
            self::Mars => 'The red planet',
        };
    }

    public function render(bool $showDescription = true): string {
        $colors = [
            'mercury' => '#9ca3af',
            'venus' => '#f59e0b',
            'earth' => '#3b82f6',
            'mars' => '#ef4444',
        ];
        $color = $colors[$this->value];
        $desc = $showDescription
            ? "<div style=\"font-size: 12px; color: #6b7280; margin-top: 2px;\">{$this->description()}</div>"
            : '';
        return <<<HTML
        <div class="planet-card" style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 10px; font-family: system-ui;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: {$color};"></div>
            <div>
                <div style="font-weight: 600; color: #111827;">{$this->name}</div>
                {$desc}
            </div>
        </div>
        HTML;
    }

}
