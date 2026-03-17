<?php
namespace App\Components;

/**
 * Demonstrates an enum implementing an interface.
 * The enum has a render() method that satisfies the interface contract.
 */
interface LevelRenderable {
    public function render(): string;
}

enum EnumLevel: string implements LevelRenderable {
    case Low = 'low';
    case Medium = 'medium';
    case High = 'high';
    case Critical = 'critical';

    public function render(): string
    {
        $colors = [
            'low' => '#22c55e',
            'medium' => '#eab308',
            'high' => '#f97316',
            'critical' => '#ef4444',
        ];
        $color = $colors[$this->value] ?? '#6b7280';
        return "<span class=\"level level-{$this->value}\" style=\"display: inline-block; padding: 4px 12px; border-radius: 6px; background: {$color}; color: white; font-weight: 600; font-size: 13px; text-transform: uppercase;\">{$this->name}</span>";
    }
}
