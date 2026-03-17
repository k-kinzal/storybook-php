<?php
namespace App\Components;

interface Stringable {
    public function __toString(): string;
}

interface Jsonable {
    public function toJson(): string;
}

class Serializer {
    public function __construct(
        private (Stringable&Jsonable)|string $data,
        private string $format = 'text',
    ) {}

    public function render(): string
    {
        return "<pre>{$this->format}</pre>";
    }
}
