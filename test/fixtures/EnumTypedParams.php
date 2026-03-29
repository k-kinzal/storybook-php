<?php
namespace App\Components;

enum Phase: string {
    case Draft = 'draft';
    case Review = 'review';
    case Published = 'published';
}

class EnumTransition {
    public function __construct(
        private Phase $from,
        private Phase $to,
        private string $label = '',
    ) {}

    public function render(): string
    {
        return "<div>{$this->from->name} -> {$this->to->name}</div>";
    }
}
