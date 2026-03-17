<?php
namespace App\Components;

/**
 * Demonstrates individual readonly promoted properties (PHP 8.1)
 * mixed with non-readonly properties and mixed promotion styles.
 */
class UserProfile {
    private string $initials;

    public function __construct(
        public readonly string $name,
        public readonly string $email,
        private string $role = 'member',
        private ?string $avatarUrl = null,
    ) {
        $words = explode(' ', $this->name);
        $this->initials = implode('', array_map(fn(string $w) => strtoupper($w[0] ?? ''), $words));
    }

    public function render(): string {
        $roleBadge = match ($this->role) {
            'admin' => '<span style="background: #dc2626; color: white; padding: 1px 8px; border-radius: 10px; font-size: 11px; margin-left: 8px;">Admin</span>',
            'editor' => '<span style="background: #2563eb; color: white; padding: 1px 8px; border-radius: 10px; font-size: 11px; margin-left: 8px;">Editor</span>',
            default => '<span style="background: #6b7280; color: white; padding: 1px 8px; border-radius: 10px; font-size: 11px; margin-left: 8px;">Member</span>',
        };

        $avatar = $this->avatarUrl !== null
            ? "<img src=\"{$this->avatarUrl}\" alt=\"{$this->name}\" style=\"width: 48px; height: 48px; border-radius: 50%; object-fit: cover;\">"
            : "<div style=\"width: 48px; height: 48px; border-radius: 50%; background: #3b82f6; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px;\">{$this->initials}</div>";

        return <<<HTML
        <div class="user-profile" style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: system-ui;">
            {$avatar}
            <div>
                <div style="font-weight: 600;">{$this->name}{$roleBadge}</div>
                <div style="color: #6b7280; font-size: 14px;">{$this->email}</div>
            </div>
        </div>
        HTML;
    }
}
