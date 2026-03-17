<?php
namespace App\Components;

/**
 * Demonstrates a pure unit enum (no backing type).
 * Case selection uses the case name directly via the _case arg.
 */
enum Suit {
    case Hearts;
    case Diamonds;
    case Clubs;
    case Spades;

    public function symbol(): string {
        return match ($this) {
            self::Hearts => '&#9829;',
            self::Diamonds => '&#9830;',
            self::Clubs => '&#9827;',
            self::Spades => '&#9824;',
        };
    }

    public function color(): string {
        return match ($this) {
            self::Hearts, self::Diamonds => '#ef4444',
            self::Clubs, self::Spades => '#111827',
        };
    }

    public function card(string $rank = 'A'): string {
        $sym = $this->symbol();
        $col = $this->color();
        return <<<HTML
        <div class="playing-card" style="display: inline-flex; flex-direction: column; align-items: center; justify-content: center; width: 80px; height: 120px; border: 2px solid #d1d5db; border-radius: 8px; background: white; font-family: serif; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <span style="font-size: 24px; font-weight: bold; color: {$col};">{$rank}</span>
            <span style="font-size: 28px; color: {$col};">{$sym}</span>
        </div>
        HTML;
    }
}
