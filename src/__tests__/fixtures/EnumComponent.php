<?php
namespace App\Components;

enum Color: string {
    case Red = 'red';
    case Blue = 'blue';
    case Green = 'green';

    public function badge(): string {
        return "<span style=\"color:{$this->value}\">{$this->name}</span>";
    }

    public function label(string $prefix = ''): string {
        return "<label>{$prefix}{$this->name}</label>";
    }
}

enum Size {
    case Small;
    case Medium;
    case Large;
}
