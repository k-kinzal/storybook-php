<?php
namespace App\Components;

abstract class AbstractFactory {
    public function __construct(
        protected string $label,
        protected string $color,
    ) {}

    abstract public function render(): string;

    public static function pill(string $label, string $color = '#3b82f6'): string {
        return "<span class=\"pill\">{$label}</span>";
    }

    public static function outline(string $label, string $color = '#3b82f6'): string {
        return "<span class=\"outline\">{$label}</span>";
    }
}

class ConcreteBadge extends AbstractFactory {
    public function render(): string {
        return "<div class=\"badge\">{$this->label}</div>";
    }
}
