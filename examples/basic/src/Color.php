<?php
namespace App\Components;

enum Color: string {
    case Red = 'red';
    case Blue = 'blue';
    case Green = 'green';
    case Purple = 'purple';

    public function badge(): string {
        return "<span class=\"badge\" style=\"background-color: {$this->value}; color: white; padding: 4px 12px; border-radius: 12px;\">{$this->name}</span>";
    }
}
