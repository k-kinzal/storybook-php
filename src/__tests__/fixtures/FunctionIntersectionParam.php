<?php
namespace App\Fixtures;

interface HasLabel {
    public function label(): string;
}

interface HasColor {
    public function color(): string;
}

function renderTagged(HasLabel&HasColor $item, string $size = 'md'): string {
    $fontSize = match ($size) {
        'sm' => '12px',
        'lg' => '18px',
        default => '14px',
    };
    return "<span style=\"color: {$item->color()}; font-size: {$fontSize};\">{$item->label()}</span>";
}
