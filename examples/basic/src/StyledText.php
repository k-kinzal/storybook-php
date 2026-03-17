<?php
namespace App\Components;

/**
 * Demonstrates object parameter defaults with `new` expressions (PHP 8.1).
 * The TextStyle object has its own constructor defaults.
 */
class TextStyle {
    public function __construct(
        public string $fontFamily = 'system-ui',
        public int $fontSize = 16,
        public string $color = '#111827',
        public string $fontWeight = 'normal',
    ) {}
}

class StyledText {
    public function __construct(
        private string $text,
        private string $tag = 'p',
        private TextStyle $style = new TextStyle(),
    ) {}

    public function render(): string {
        $css = "font-family: {$this->style->fontFamily}; font-size: {$this->style->fontSize}px; color: {$this->style->color}; font-weight: {$this->style->fontWeight}; margin: 0;";
        return "<{$this->tag} style=\"{$css}\">{$this->text}</{$this->tag}>";
    }
}
