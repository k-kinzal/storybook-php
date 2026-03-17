<?php
namespace App\Components;

class Meter {
    public function __construct(
        private int|float $value,
        private int|float $min = 0,
        private int|float $max = 100,
        private string $label = '',
    ) {}

    public function render(?string $color = null): string
    {
        return "rendered";
    }
}
