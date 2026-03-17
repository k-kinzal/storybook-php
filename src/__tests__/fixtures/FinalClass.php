<?php
namespace App\Components;

final class Avatar {
    public function __construct(
        private string $name,
        private int $size = 48,
        private ?string $imageUrl = null,
    ) {}

    public function render(): string {
        if ($this->imageUrl !== null) {
            return "<div class=\"avatar\"><img src=\"{$this->imageUrl}\" alt=\"{$this->name}\" /></div>";
        }
        $initials = mb_strtoupper(mb_substr($this->name, 0, 1));
        return "<div class=\"avatar\" style=\"width: {$this->size}px;\">{$initials}</div>";
    }
}
