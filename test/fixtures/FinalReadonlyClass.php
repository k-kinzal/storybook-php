<?php
namespace App\Components;

final readonly class Coordinate {
    public function __construct(
        public float $latitude,
        public float $longitude,
    ) {}

    public function render(): string
    {
        return "<span class=\"coordinate\">{$this->latitude}, {$this->longitude}</span>";
    }

    public static function origin(): string
    {
        return (new self(0.0, 0.0))->render();
    }
}
