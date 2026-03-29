<?php
namespace App\Components;

class HtmlFragment {
    private string $html = '';

    public function __construct(private string $tag = 'div') {}

    public function append(string $content): self {
        $this->html .= $content;
        return $this;
    }

    public function __toString(): string {
        return "<{$this->tag}>{$this->html}</{$this->tag}>";
    }
}

class FragmentBuilder {
    public function __construct(
        private string $heading,
        private string $body = '',
    ) {}

    public function render(): HtmlFragment {
        $fragment = new HtmlFragment('article');
        $fragment->append("<h3>{$this->heading}</h3>");
        if ($this->body !== '') {
            $fragment->append("<p>{$this->body}</p>");
        }
        return $fragment;
    }
}
