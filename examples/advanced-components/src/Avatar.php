<?php
namespace App\Components;

final class Avatar {
    public function __construct(
        private string $name,
        private int $size = 48,
        private ?string $imageUrl = null,
    ) {}

    public function render(): string {
        $initials = $this->getInitials();
        $style = "width: {$this->size}px; height: {$this->size}px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;";

        if ($this->imageUrl !== null) {
            return "<div class=\"avatar\" style=\"{$style}\"><img src=\"{$this->imageUrl}\" alt=\"{$this->name}\" style=\"width: 100%; height: 100%; border-radius: 50%; object-fit: cover;\" /></div>";
        }

        $bg = $this->colorFromName();
        return "<div class=\"avatar\" style=\"{$style} background-color: {$bg}; color: white; font-size: " . intdiv($this->size, 3) . "px;\">{$initials}</div>";
    }

    private function getInitials(): string {
        $parts = explode(' ', $this->name);
        $initials = array_map(fn(string $p) => mb_strtoupper(mb_substr($p, 0, 1)), $parts);
        return implode('', array_slice($initials, 0, 2));
    }

    private function colorFromName(): string {
        $colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
        return $colors[crc32($this->name) % count($colors)];
    }
}
