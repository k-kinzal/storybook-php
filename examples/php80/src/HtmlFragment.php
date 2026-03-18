<?php
namespace App\Components;

/**
 * Demonstrates __toString support. The render method returns
 * an object implementing __toString, which the runner automatically
 * converts to string.
 */
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
        private string $tag = 'article',
    ) {}

    public function render(): HtmlFragment {
        $fragment = new HtmlFragment($this->tag);
        $fragment->append("<h3 style=\"margin: 0 0 8px 0;\">{$this->heading}</h3>");
        if ($this->body !== '') {
            $fragment->append("<p style=\"margin: 0; color: #4b5563;\">{$this->body}</p>");
        }
        return $fragment;
    }
}
