<?php
namespace App\Components;

/**
 * Demonstrates class composition: Author is defined in the same file
 * and used as a typed constructor parameter of ComposedCard.
 * The runner recursively instantiates Author from JSON args.
 */
class Author {
    public function __construct(
        public readonly string $name,
        public readonly string $role = 'Contributor',
        public readonly string $avatar = '',
    ) {}
}

class ComposedCard {
    public function __construct(
        private string $title,
        private Author $author,
        private string $body = '',
        private string $date = '',
    ) {}

    public function render(): string {
        $avatarHtml = $this->author->avatar !== ''
            ? "<img src=\"{$this->author->avatar}\" alt=\"\" style=\"width: 32px; height: 32px; border-radius: 50%; object-fit: cover;\">"
            : "<div style=\"width: 32px; height: 32px; border-radius: 50%; background: #dbeafe; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #3b82f6; font-size: 14px;\">" . strtoupper(substr($this->author->name, 0, 1)) . "</div>";

        $dateHtml = $this->date !== ''
            ? "<span style=\"color: #9ca3af; font-size: 12px;\">{$this->date}</span>"
            : '';

        $bodyHtml = $this->body !== ''
            ? "<p style=\"margin: 12px 0 0; color: #374151; font-size: 14px; line-height: 1.5;\">{$this->body}</p>"
            : '';

        return <<<HTML
        <div class="composed-card" style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; font-family: system-ui; max-width: 400px;">
            <h3 style="margin: 0 0 12px; font-size: 18px; color: #111827;">{$this->title}</h3>
            <div style="display: flex; align-items: center; gap: 10px;">
                {$avatarHtml}
                <div>
                    <div style="font-weight: 600; font-size: 14px; color: #111827;">{$this->author->name}</div>
                    <div style="font-size: 12px; color: #6b7280;">{$this->author->role}</div>
                </div>
                {$dateHtml}
            </div>
            {$bodyHtml}
        </div>
        HTML;
    }
}
