<?php
namespace App\Fixtures;

enum EnumStaticInstance: string {
    case Info = 'info';
    case Warning = 'warning';
    case Error = 'error';

    public function badge(): string {
        return "<span class=\"badge-{$this->value}\">{$this->name}</span>";
    }

    public static function all(): string {
        $html = '<div class="badge-list">';
        foreach (self::cases() as $case) {
            $html .= $case->badge();
        }
        $html .= '</div>';
        return $html;
    }
}
