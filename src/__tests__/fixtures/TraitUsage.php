<?php
namespace App\Components;

trait HasToggle {
    public function toggle(string $content, bool $open = false): string {
        return "<details>{$content}</details>";
    }
}

trait HasTooltip {
    public function tooltip(string $text): string {
        return "<span class=\"tooltip\">{$text}</span>";
    }
}

class Accordion {
    use HasToggle;

    public function __construct(private string $label) {}
}

class RichWidget {
    use HasToggle, HasTooltip;

    public function __construct(private string $title) {}
}
