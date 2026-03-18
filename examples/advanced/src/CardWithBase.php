<?php
namespace App\Components;

class BaseComponent {
    public function render(string $content): string {
        return "<div class=\"base-component\">{$content}</div>";
    }
}

class CardWithBase extends BaseComponent {
    public function __construct(private string $title) {}
    // render() is inherited from BaseComponent
}
