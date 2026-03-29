<?php
namespace App\Components;

class ConstructorBase
{
    public function __construct(protected string $label) {}

    public function render(): string
    {
        return "<div>{$this->label}</div>";
    }
}

class ConstructorOverride extends ConstructorBase
{
    public function __construct()
    {
        parent::__construct("fixed");
    }
}
