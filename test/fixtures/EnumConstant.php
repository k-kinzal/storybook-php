<?php
namespace App\Components;

enum EnumConstant: string {
    const DEFAULT_FORMAT = 'badge';

    case Success = 'success';
    case Warning = 'warning';
    case Danger = 'danger';

    public function badge(): string {
        return "<span>{$this->name}</span>";
    }

    public static function all(string $separator = ' '): string {
        return implode($separator, array_map(fn($c) => $c->badge(), self::cases()));
    }
}
