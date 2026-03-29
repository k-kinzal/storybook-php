<?php
namespace App\Components;

class Slide {
    public function __construct(
        public readonly string $content,
        public readonly string $caption = '',
    ) {}

    public function __toString(): string
    {
        return "<div>{$this->content}</div>";
    }
}

class Carousel {
    public function __construct(
        private int $activeIndex = 0,
        private bool $autoplay = false,
        Slide ...$slides,
    ) {}

    public function render(string ...$items): string
    {
        return "rendered";
    }
}
