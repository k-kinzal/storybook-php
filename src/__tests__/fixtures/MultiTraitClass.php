<?php
namespace App\Components;

trait HasIcon {
    public function icon(string $name, int $size = 24): string {
        return "<span class=\"icon icon-{$name}\" style=\"width: {$size}px;\">*</span>";
    }
}

trait HasBadge {
    public function badge(string $text, string $color = 'blue'): string {
        return "<span class=\"badge\" style=\"color: {$color};\">{$text}</span>";
    }
}

class Widget {
    use HasIcon, HasBadge;

    public function __construct(private string $title) {}

    public function render(): string {
        return "<div>{$this->title}</div>";
    }
}
