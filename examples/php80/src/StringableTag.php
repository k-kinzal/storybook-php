<?php
namespace App\Components;

class HtmlTag {
    public function __construct(
        private string $tag,
        private string $content,
        private string $class = '',
    ) {}

    public function __toString(): string {
        $cls = $this->class ? " class=\"{$this->class}\"" : '';
        return "<{$this->tag}{$cls}>{$this->content}</{$this->tag}>";
    }
}

class StringableTag {
    public function __construct(
        private string $text,
        private string $tag = 'span',
        private string $wrapper = 'div',
    ) {}

    public function render(): string {
        $inner = new HtmlTag($this->tag, htmlspecialchars($this->text), 'tag-content');
        $outer = new HtmlTag($this->wrapper, (string) $inner, 'tag-wrapper');
        return (string) $outer;
    }
}
