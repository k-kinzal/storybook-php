<?php

namespace App\Components;

/**
 * Untyped parameter example: typeMap.files[*].args provides the concrete class
 * so runtime object casting still works.
 */
class UntypedBlock
{
    public function __construct(
        private string $title,
        private $content,
    ) {}

    public function render(): string
    {
        return "<article style=\"font-family: system-ui; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; max-width: 420px;\"><h3 style=\"margin: 0 0 12px;\">{$this->title}</h3>{$this->content->toHtml()}</article>";
    }
}
