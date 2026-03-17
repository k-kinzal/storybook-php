<?php
namespace App\Components;

/**
 * Demonstrates method parameters with class constant defaults.
 * Both constructor and render method use self:: constant references.
 */
class MethodConstantDefault {
    public const FORMAT_HTML = 'html';
    public const FORMAT_TEXT = 'text';
    public const MAX_LENGTH = 120;

    public function __construct(
        private string $content,
        private string $title = 'Untitled',
    ) {}

    public function render(string $format = self::FORMAT_HTML, int $maxLength = self::MAX_LENGTH): string {
        $text = mb_substr($this->content, 0, $maxLength);
        $truncated = mb_strlen($this->content) > $maxLength ? '...' : '';

        if ($format === self::FORMAT_TEXT) {
            return strip_tags("{$this->title}: {$text}{$truncated}");
        }

        return "<div class=\"mcd\" style=\"padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: system-ui;\">
            <h3 style=\"margin: 0 0 8px; color: #111827;\">{$this->title}</h3>
            <p style=\"margin: 0; color: #4b5563; line-height: 1.5;\">{$text}{$truncated}</p>
        </div>";
    }
}
