<?php
namespace App\Components;

enum Priority: int {
    case Low = 1;
    case Medium = 2;
    case High = 3;
    case Critical = 4;

    public function badge(): string {
        return "<span class=\"badge priority-{$this->name}\">{$this->name}</span>";
    }

    public function icon(): string {
        return "<span class=\"priority-icon\">{$this->name}</span>";
    }
}
