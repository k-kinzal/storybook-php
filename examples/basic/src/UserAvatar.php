<?php
namespace App\Components;

/**
 * Demonstrates a class with multiple render methods, each producing
 * a different visual representation. Story files import different @methods.
 */
class UserAvatar {
    public function __construct(
        private string $name,
        private string $email = '',
        private string $imageUrl = '',
        private string $size = 'md',
    ) {}

    public function circle(): string {
        $dim = match ($this->size) {
            'sm' => 32, 'lg' => 64, 'xl' => 96, default => 48,
        };
        $fontSize = (int)($dim * 0.4);
        $initials = $this->initials();

        if ($this->imageUrl !== '') {
            return "<img src=\"{$this->imageUrl}\" alt=\"{$this->name}\" style=\"width: {$dim}px; height: {$dim}px; border-radius: 50%; object-fit: cover;\">";
        }

        $bg = $this->colorFromName();
        return "<div style=\"width: {$dim}px; height: {$dim}px; border-radius: 50%; background: {$bg}; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: {$fontSize}px; font-family: system-ui;\">{$initials}</div>";
    }

    public function card(): string {
        $avatar = $this->circle();
        $emailHtml = $this->email !== '' ? "<div style=\"font-size: 12px; color: #6b7280;\">{$this->email}</div>" : '';

        return <<<HTML
        <div style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 10px; font-family: system-ui; max-width: 300px;">
            {$avatar}
            <div>
                <div style="font-weight: 600; font-size: 14px; color: #111827;">{$this->name}</div>
                {$emailHtml}
            </div>
        </div>
        HTML;
    }

    public function badge(): string {
        $initials = $this->initials();
        $bg = $this->colorFromName();
        return "<span style=\"display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px 4px 4px; background: #f3f4f6; border-radius: 20px; font-family: system-ui; font-size: 13px;\"><span style=\"display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: {$bg}; color: white; font-size: 10px; font-weight: 700;\">{$initials}</span><span style=\"font-weight: 500; color: #374151;\">{$this->name}</span></span>";
    }

    private function initials(): string {
        $parts = explode(' ', $this->name);
        return strtoupper(substr($parts[0], 0, 1) . (isset($parts[1]) ? substr($parts[1], 0, 1) : ''));
    }

    private function colorFromName(): string {
        $colors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
        $hash = crc32($this->name);
        return $colors[abs($hash) % count($colors)];
    }
}
