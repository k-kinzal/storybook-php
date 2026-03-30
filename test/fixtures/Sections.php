<?php
namespace App\Components;

class SectionHeader {
    public function __construct(
        private string $title,
        private string $level = 'h1',
    ) {}

    public function render(): string {
        $tag = in_array($this->level, ['h1','h2','h3']) ? $this->level : 'h1';
        return "<{$tag}>{$this->title}</{$tag}>";
    }
}

class SectionFooter {
    public function __construct(
        private string $copyright,
        private int $year = 2025,
    ) {}

    public function render(): string {
        return "<footer>&copy; {$this->year} {$this->copyright}</footer>";
    }
}
