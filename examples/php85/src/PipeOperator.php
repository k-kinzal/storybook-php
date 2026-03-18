<?php

namespace App\Components;

class PipeOperator
{
    public function __construct(
        private string $text = 'hello world',
        private string $wrapper = 'p',
    ) {}

    public function render(): string
    {
        $result = $this->text
            |> trim(...)
            |> ucwords(...)
            |> htmlspecialchars(...);

        return "<{$this->wrapper} class=\"piped\">{$result}</{$this->wrapper}>";
    }
}
