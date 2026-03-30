<?php

namespace App\Components;

class UnionOverrideRenderer
{
    public function __construct(
        private $value,
    ) {}

    public function render(): string
    {
        $stringValue = is_scalar($this->value) ? (string) $this->value : get_debug_type($this->value);

        return '<span data-type="' . get_debug_type($this->value) . '">' . $stringValue . '</span>';
    }
}
