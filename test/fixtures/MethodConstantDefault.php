<?php
namespace App\Components;

/**
 * Demonstrates method parameters with class constant defaults.
 * Both constructor and method use self:: constant references.
 */
class MethodConstantDefault {
    public const FORMAT_HTML = 'html';
    public const FORMAT_TEXT = 'text';
    public const MAX_LENGTH = 100;

    public function __construct(
        private string $content,
    ) {}

    public function render(string $format = self::FORMAT_HTML, int $maxLength = self::MAX_LENGTH): string {
        $text = mb_substr($this->content, 0, $maxLength);
        if ($format === 'text') {
            return strip_tags($text);
        }
        return "<div class=\"mcd\">{$text}</div>";
    }
}
