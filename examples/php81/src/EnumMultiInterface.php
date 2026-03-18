<?php
namespace App\Components;

interface HasLabel {
    public function label(): string;
}

interface HasIcon {
    public function icon(): string;
}

/**
 * Demonstrates enum implementing multiple interfaces.
 */
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
        $icon = $icons[$this->value] ?? '?';
        return "<span class=\"enum-icon enum-icon-{$this->value}\" style=\"font-size: 20px;\">{$icon}</span>";
    }

    public function menuItem(): string {
        return "<a class=\"menu-item menu-item-{$this->value}\" href=\"#{$this->value}\" style=\"display: flex; align-items: center; gap: 8px; padding: 8px 16px; text-decoration: none; color: #374151; border-radius: 6px;\">{$this->icon()} {$this->label()}</a>";
    }
}
