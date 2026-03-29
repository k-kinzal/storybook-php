<?php

namespace App\Components;

class ValueObject {
    public function __construct(
        readonly string $id,
        readonly int $value,
        private readonly string $secret = 'hidden',
    ) {}

    public function render(): string
    {
        return "<span>{$this->id}: {$this->value}</span>";
    }
}
