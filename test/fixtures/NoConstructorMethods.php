<?php
namespace App\Components;

class Snippet {
    public function render(string $code, string $language = 'php', bool $lineNumbers = false): string
    {
        return "<pre class=\"snippet-{$language}\">{$code}</pre>";
    }

    public function inline(string $code): string
    {
        return "<code>{$code}</code>";
    }
}
