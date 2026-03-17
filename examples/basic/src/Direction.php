<?php
namespace App\Components;

interface Renderable {
    public function render(): string;
}

enum Direction: string implements Renderable {
    case Up = 'up';
    case Down = 'down';
    case Left = 'left';
    case Right = 'right';

    public function render(): string {
        $arrows = [
            'up' => '&#8593;',
            'down' => '&#8595;',
            'left' => '&#8592;',
            'right' => '&#8594;',
        ];
        $arrow = $arrows[$this->value] ?? '?';
        return "<span class=\"direction direction-{$this->value}\" style=\"display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 24px;\">{$arrow} <span style=\"font-size: 14px;\">{$this->name}</span></span>";
    }
}
