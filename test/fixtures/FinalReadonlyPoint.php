<?php
namespace App\Components;

final readonly class Point {
    public function __construct(
        public float $x,
        public float $y,
        public string $label = '',
    ) {}

    public function render(): string {
        $labelHtml = $this->label !== '' ? " ({$this->label})" : '';
        return "<span class=\"point\">({$this->x}, {$this->y}){$labelHtml}</span>";
    }

    public static function origin(): string {
        return (new self(0.0, 0.0, 'origin'))->render();
    }
}
