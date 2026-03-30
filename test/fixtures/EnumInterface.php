<?php
namespace App\Components;

interface HasLabel {
    public function label(): string;
}

enum LogLevel: string implements HasLabel {
    case Debug = 'debug';
    case Info = 'info';
    case Warning = 'warning';
    case Error = 'error';

    public function label(): string {
        return ucfirst($this->value);
    }

    public function badge(): string {
        return "<span class=\"log-{$this->value}\">{$this->label()}</span>";
    }
}
