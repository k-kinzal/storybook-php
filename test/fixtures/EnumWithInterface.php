<?php
namespace App\Components;

interface Renderable {
    public function render(): string;
}

enum Level: string implements Renderable {
    case Low = 'low';
    case Medium = 'medium';
    case High = 'high';

    public function render(): string
    {
        return "<span class=\"level-{$this->value}\">{$this->name}</span>";
    }
}
