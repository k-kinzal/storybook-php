<?php
namespace App\Components;

/**
 * Demonstrates a standalone readonly class (PHP 8.2).
 * All properties are implicitly readonly when the class is declared readonly.
 */
readonly class ReadonlyContact {
    public function __construct(
        public string $name,
        public string $email,
        public string $role = 'Member',
        public ?string $avatar = null,
    ) {}

    public function render(): string {
        $initials = implode('', array_map(fn($w) => mb_strtoupper(mb_substr($w, 0, 1)), explode(' ', $this->name)));
        $avatarHtml = $this->avatar !== null
            ? "<img src=\"{$this->avatar}\" alt=\"{$this->name}\" style=\"width: 40px; height: 40px; border-radius: 50%; object-fit: cover;\">"
            : "<div style=\"width: 40px; height: 40px; border-radius: 50%; background: #3b82f6; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;\">{$initials}</div>";

        return "<div class=\"contact-card\" style=\"display: flex; align-items: center; gap: 12px; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 10px; font-family: system-ui;\">
            {$avatarHtml}
            <div>
                <div style=\"font-weight: 600; font-size: 15px;\">{$this->name}</div>
                <div style=\"font-size: 13px; color: #6b7280;\">{$this->email}</div>
                <span style=\"display: inline-block; margin-top: 4px; padding: 1px 8px; font-size: 11px; border-radius: 4px; background: #f3f4f6; color: #374151;\">{$this->role}</span>
            </div>
        </div>";
    }
}
