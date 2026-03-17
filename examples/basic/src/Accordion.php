<?php
namespace App\Components;

trait HasToggle {
    public function toggle(string $content, bool $open = false): string {
        $state = $open ? ' open' : '';
        $attr = $open ? ' open' : '';
        return "<details class=\"toggle{$state}\"{$attr}><summary>{$this->label}</summary><div class=\"toggle-content\">{$content}</div></details>";
    }
}

class Accordion {
    use HasToggle;

    public function __construct(private string $label) {}
}
