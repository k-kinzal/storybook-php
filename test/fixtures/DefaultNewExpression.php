<?php
namespace App\Components;

class Options {
    public function __construct(
        public string $color = 'blue',
        public int $size = 16,
    ) {}
}

class Widget {
    public function __construct(
        private string $title,
        private Options $options = new Options(),
        private ?string $subtitle = null,
    ) {}

    public function render(): string
    {
        return "<div class=\"widget\">{$this->title}</div>";
    }
}
