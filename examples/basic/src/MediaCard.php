<?php
namespace App\Components;

/**
 * Demonstrates a class with multiple distinct render methods.
 * Each method provides a different view of the same data.
 */
class MediaCard {
    public function __construct(
        private string $title,
        private string $description = '',
        private ?string $imageUrl = null,
        private string $category = 'general',
    ) {}

    public function compact(): string {
        $img = $this->imageUrl !== null
            ? "<img src=\"{$this->imageUrl}\" alt=\"{$this->title}\" style=\"width: 48px; height: 48px; border-radius: 4px; object-fit: cover;\">"
            : '';
        return "<div class=\"media-card media-card-compact\" style=\"display: flex; align-items: center; gap: 12px; padding: 8px; border: 1px solid #e5e7eb; border-radius: 6px;\">{$img}<div><strong>{$this->title}</strong><span class=\"media-category\" style=\"margin-left: 8px; color: #6b7280; font-size: 12px;\">{$this->category}</span></div></div>";
    }

    public function full(): string {
        $img = $this->imageUrl !== null
            ? "<img src=\"{$this->imageUrl}\" alt=\"{$this->title}\" style=\"width: 100%; height: 200px; object-fit: cover; border-radius: 8px 8px 0 0;\">"
            : '';
        $desc = $this->description !== '' ? "<p class=\"media-desc\">{$this->description}</p>" : '';
        return "<div class=\"media-card media-card-full\" style=\"border: 1px solid #e5e7eb; border-radius: 8px; max-width: 360px;\">{$img}<div style=\"padding: 16px;\"><h3 style=\"margin: 0 0 8px 0;\">{$this->title}</h3>{$desc}<span class=\"media-category\" style=\"color: #6b7280; font-size: 12px;\">{$this->category}</span></div></div>";
    }

    public function header(): string {
        return "<div class=\"media-card media-card-header\" style=\"padding: 12px 16px; border-bottom: 2px solid #3b82f6;\"><h2 style=\"margin: 0;\">{$this->title}</h2></div>";
    }
}
