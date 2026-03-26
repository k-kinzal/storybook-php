<?php

namespace App\Components;

class TypeMapChild extends TypeMapBase
{
    public function __construct(
        string $title,
        private string $message = '',
        string $color = 'blue',
    ) {
        parent::__construct($title, $color);
    }

    protected function body(): string
    {
        return "<p>{$this->message}</p>";
    }
}
