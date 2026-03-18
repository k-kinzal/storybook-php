<?php
namespace App\Components;

/**
 * Demonstrates returning a Stringable value object from a class method.
 * When a method returns an object with __toString, the runner's resolveOutput
 * converts it to a string automatically.
 */
class MoodBadge implements \Stringable {
    public function __construct(
        private string $name,
        private string $emoji,
        private string $color,
    ) {}

    public function __toString(): string {
        return "<span class=\"mood mood-{$this->name}\" style=\"display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 20px; background: {$this->color}20; border: 1px solid {$this->color}; font-family: system-ui;\"><span style=\"font-size: 20px;\">{$this->emoji}</span><span style=\"color: {$this->color}; font-weight: 600; text-transform: capitalize;\">{$this->name}</span></span>";
    }
}

enum Mood: string {
    case Happy = 'happy';
    case Sad = 'sad';
    case Neutral = 'neutral';
    case Excited = 'excited';

    public function render(): string {
        return (string) $this->toBadge();
    }

    public function toBadge(): MoodBadge {
        $emojis = ['happy' => '&#x1F60A;', 'sad' => '&#x1F622;', 'neutral' => '&#x1F610;', 'excited' => '&#x1F929;'];
        $colors = ['happy' => '#22c55e', 'sad' => '#3b82f6', 'neutral' => '#6b7280', 'excited' => '#f59e0b'];
        return new MoodBadge($this->name, $emojis[$this->value] ?? '', $colors[$this->value] ?? '#6b7280');
    }
}

class MoodCard {
    public function __construct(
        private Mood $mood = Mood::Neutral,
        private string $message = '',
    ) {}

    /**
     * Returns a MoodBadge (Stringable) from the enum case.
     * The runner's resolveOutput converts it via __toString.
     */
    public function badge(): MoodBadge {
        return $this->mood->toBadge();
    }

    public function render(): string {
        $badge = (string) $this->mood->toBadge();
        $msgHtml = $this->message !== '' ? "<p style=\"margin: 8px 0 0; color: #374151; font-size: 14px;\">{$this->message}</p>" : '';
        return "<div class=\"mood-card\" style=\"padding: 16px; border: 1px solid #e5e7eb; border-radius: 10px; font-family: system-ui;\">{$badge}{$msgHtml}</div>";
    }
}
