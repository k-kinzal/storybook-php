<?php

namespace App\Components;

class DataRenderer {
    public function __construct(
        private mixed $data,
        private iterable $items = [],
        private ?callable $formatter = null,
    ) {}

    public function render(): string
    {
        return "rendered";
    }

    public static function fromArray(array $data, string $format = 'html'): string
    {
        return "<div>{$format}</div>";
    }
}
