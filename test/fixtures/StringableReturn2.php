<?php
namespace App\Components;

class HtmlElement {
    public function __construct(
        private string $tag,
        private string $content,
    ) {}

    public function __toString(): string {
        return "<{$this->tag}>{$this->content}</{$this->tag}>";
    }
}

class StringableWrapper {
    public function __construct(
        private string $text,
        private string $tag = 'span',
    ) {}

    public function render(): string {
        $el = new HtmlElement($this->tag, $this->text);
        return (string) $el;
    }
}
