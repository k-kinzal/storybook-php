<?php
namespace App\Components;

interface HasLabel {
    public function label(): string;
}

interface HasIcon {
    public function icon(): string;
}

enum EnumMultiInterface: string implements HasLabel, HasIcon {
    case Home = 'home';
    case Settings = 'settings';
    case Profile = 'profile';
    case Logout = 'logout';

    public function label(): string {
        return match($this) {
            self::Home => 'Home',
            self::Settings => 'Settings',
            self::Profile => 'My Profile',
            self::Logout => 'Log Out',
        };
    }

    public function icon(): string {
        $icons = [
            'home' => '&#x1F3E0;',
            'settings' => '&#x2699;',
            'profile' => '&#x1F464;',
            'logout' => '&#x1F6AA;',
        ];
        return "<span class=\"enum-icon enum-icon-{$this->value}\">" . ($icons[$this->value] ?? '?') . "</span>";
    }

    public function menuItem(): string {
        return "<a class=\"menu-item menu-item-{$this->value}\">{$this->icon()} {$this->label()}</a>";
    }
}
