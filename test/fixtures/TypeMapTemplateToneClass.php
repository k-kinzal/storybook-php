<?php

namespace App\Templates;

class SnippetTone
{
    public function __construct(
        public string $value,
    ) {
    }

    public function label(): string
    {
        return strtoupper($this->value);
    }
}
