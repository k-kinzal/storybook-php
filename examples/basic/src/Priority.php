<?php
namespace App\Components;

enum Priority: int {
    case Low = 1;
    case Medium = 2;
    case High = 3;
    case Critical = 4;

    public function badge(): string {
        $colors = [
            1 => '#6b7280',
            2 => '#3b82f6',
            3 => '#f59e0b',
            4 => '#ef4444',
        ];
        $color = $colors[$this->value] ?? '#6b7280';
        return "<span class=\"badge priority-{$this->name}\" style=\"background-color: {$color}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;\">{$this->name}</span>";
    }

    public function icon(): string {
        $icons = [
            'Low' => '&#x25CB;',
            'Medium' => '&#x25D1;',
            'High' => '&#x25C9;',
            'Critical' => '&#x26A0;',
        ];
        $ico = $icons[$this->name] ?? '';
        return "<span class=\"priority-icon\">{$ico} {$this->name}</span>";
    }
}
