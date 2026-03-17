<?php
namespace App\Components;

class Anchor {
    public function __construct(
        private string $text,
        private ?string $href = null,
        private string $target = '_self',
        private bool $underline = true,
    ) {}

    public function render(): string {
        $url = $this->href ?? '#';
        $style = 'color: #3b82f6; text-decoration: ' . ($this->underline ? 'underline' : 'none') . ';';
        $targetAttr = $this->target !== '_self' ? " target=\"{$this->target}\" rel=\"noopener noreferrer\"" : '';
        return "<a href=\"{$url}\" style=\"{$style}\"{$targetAttr}>{$this->text}</a>";
    }
}
