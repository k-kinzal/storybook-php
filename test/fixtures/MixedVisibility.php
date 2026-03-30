<?php
namespace App\Components;

class MixedVisibility {
    public function __construct(
        public string $label,
        private string $variant = 'default',
        protected int $maxLength = 50,
        public bool $truncate = false,
    ) {}

    public function render(): string {
        $text = $this->label;
        if ($this->truncate && mb_strlen($text) > $this->maxLength) {
            $text = mb_substr($text, 0, $this->maxLength) . '...';
        }
        return "<div class=\"mixed-vis mixed-vis-{$this->variant}\">{$text}</div>";
    }
}
