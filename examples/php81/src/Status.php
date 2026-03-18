<?php
namespace App\Components;

enum Status: string {
    case Active = 'active';
    case Inactive = 'inactive';
    case Pending = 'pending';

    public function label(string $prefix = '', bool $uppercase = false): string {
        $text = $prefix !== '' ? "{$prefix}: {$this->name}" : $this->name;
        if ($uppercase) {
            $text = strtoupper($text);
        }
        $colors = [
            'active' => '#22c55e',
            'inactive' => '#ef4444',
            'pending' => '#f59e0b',
        ];
        $color = $colors[$this->value] ?? '#6b7280';
        return "<span class=\"status-label\" style=\"color: {$color}; font-weight: bold;\">{$text}</span>";
    }
}
