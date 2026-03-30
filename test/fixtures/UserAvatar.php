<?php
namespace App\Components;

class UserAvatar {
    public function __construct(
        private string $name,
        private string $email = '',
        private string $size = 'md',
    ) {}

    public function circle(): string {
        $initials = strtoupper(substr($this->name, 0, 1));
        $dim = match ($this->size) {
            'sm' => 32, 'lg' => 64, default => 48,
        };
        return "<div class=\"avatar\" style=\"width:{$dim}px;height:{$dim}px;\">{$initials}</div>";
    }

    public function card(): string {
        $avatar = $this->circle();
        return "<div class=\"avatar-card\">{$avatar}<span>{$this->name}</span></div>";
    }

    public function badge(): string {
        $initials = strtoupper(substr($this->name, 0, 1));
        return "<span class=\"avatar-badge\">{$initials} {$this->name}</span>";
    }
}
