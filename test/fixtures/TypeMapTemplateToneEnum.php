<?php

namespace App\Templates;

enum SnippetTone: string
{
    case info = 'info';
    case success = 'success';

    public function label(): string
    {
        return strtoupper($this->value);
    }
}
