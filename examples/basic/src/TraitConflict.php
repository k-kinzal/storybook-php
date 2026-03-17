<?php
namespace App\Components;

/**
 * Demonstrates PHP trait conflict resolution using `insteadof` and `as`.
 * When two traits define the same method, the class must resolve the
 * conflict explicitly. The `insteadof` keyword picks one, and `as`
 * creates an alias for the other.
 */
trait HasHtmlOutput {
    public function format(string $text, string $tag = 'div'): string {
        return "<{$tag} class=\"html-output\" style=\"padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: system-ui;\">{$text}</{$tag}>";
    }
}

trait HasPlainOutput {
    public function format(string $text, string $tag = 'pre'): string {
        return "<{$tag} class=\"plain-output\" style=\"padding: 12px; background: #f9fafb; border-radius: 8px; font-family: monospace; white-space: pre-wrap;\">{$text}</{$tag}>";
    }
}

class TraitConflict {
    use HasHtmlOutput, HasPlainOutput {
        HasHtmlOutput::format insteadof HasPlainOutput;
        HasPlainOutput::format as formatPlain;
    }

    public function __construct(
        private string $title = 'Output',
    ) {}

    public function render(string $content, string $mode = 'html'): string {
        $header = "<h4 style=\"margin: 0 0 8px; font-family: system-ui; color: #374151;\">{$this->title}</h4>";
        return $header . ($mode === 'plain' ? $this->formatPlain($content) : $this->format($content));
    }
}
