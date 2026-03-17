<?php
namespace App\Components;

enum Permission: string {
    case Read = 'read';
    case Write = 'write';
    case Delete = 'delete';
    case Admin = 'admin';

    public function badge(): string {
        return "<span class=\"perm-{$this->value}\">{$this->name}</span>";
    }

    public function includes(string $action): string {
        $hierarchy = [
            'admin'  => ['read', 'write', 'delete', 'admin'],
            'delete' => ['read', 'write', 'delete'],
            'write'  => ['read', 'write'],
            'read'   => ['read'],
        ];
        $allowed = $hierarchy[$this->value] ?? [];
        $has = in_array($action, $allowed, true);
        return "<span>" . ($has ? 'Allowed' : 'Denied') . "</span>";
    }

    public static function matrix(): string {
        $html = '<table>';
        foreach (self::cases() as $perm) {
            $html .= "<tr><td>{$perm->name}</td></tr>";
        }
        return $html . '</table>';
    }
}
