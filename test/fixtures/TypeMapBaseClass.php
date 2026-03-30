<?php

namespace App\Components;

abstract class TypeMapBase
{
    public function __construct(
        protected string $title,
        protected string $color = 'blue',
    ) {}

    abstract protected function body(): string;

    public function render(): string
    {
        return "<div style=\"color:{$this->color}\"><h2>{$this->title}</h2>{$this->body()}</div>";
    }
}
