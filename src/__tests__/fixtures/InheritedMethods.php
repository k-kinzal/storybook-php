<?php
namespace App\Components;

class BaseComponent {
    public function render(string $content): string {
        return "<div class=\"base\">{$content}</div>";
    }

    protected function helper(): string {
        return "helper";
    }
}

class Card extends BaseComponent {
    public function __construct(private string $title) {}
    // render() inherited from BaseComponent
}

abstract class AbstractWidget {
    abstract public function render(): string;
}
