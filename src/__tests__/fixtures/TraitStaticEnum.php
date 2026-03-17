<?php
namespace App\Components;

trait HasShowcase {
    public static function showcase(): string {
        $html = '<div>';
        foreach (self::cases() as $case) {
            $html .= $case->swatch();
        }
        $html .= '</div>';
        return $html;
    }
}

enum Swatch: string {
    use HasShowcase;

    case Red = 'red';
    case Blue = 'blue';
    case Green = 'green';

    public function swatch(): string {
        return "<span style=\"color: {$this->value};\">{$this->name}</span>";
    }
}
