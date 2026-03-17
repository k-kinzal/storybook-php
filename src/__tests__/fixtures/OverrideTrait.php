<?php
namespace Tests\Fixtures;

trait HasDefaultRender {
    public function render(): string {
        return "<div>default</div>";
    }

    public function badge(): string {
        return "<span class=\"badge\">default</span>";
    }
}

class OverrideTrait {
    use HasDefaultRender;

    public function __construct(
        private string $title,
    ) {}

    public function render(): string {
        return "<div class=\"custom\">{$this->title} {$this->badge()}</div>";
    }
}
