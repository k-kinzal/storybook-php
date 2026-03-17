<?php
namespace App\Components;

/**
 * Demonstrates a string-backed enum with methods.
 * The _case arg accepts the backing value (the string).
 */
enum Language: string {
    case English = 'en';
    case Japanese = 'ja';
    case French = 'fr';
    case Spanish = 'es';
    case German = 'de';

    public function greeting(string $name): string {
        $text = match ($this) {
            self::English => "Hello, {$name}!",
            self::Japanese => "こんにちは、{$name}さん！",
            self::French => "Bonjour, {$name} !",
            self::Spanish => "¡Hola, {$name}!",
            self::German => "Hallo, {$name}!",
        };
        return "<div class=\"language-greeting\" style=\"display: inline-flex; align-items: center; gap: 8px; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: system-ui;\"><span class=\"lang-code\" style=\"display: inline-block; padding: 2px 8px; border-radius: 4px; background: #6366f1; color: white; font-size: 12px; font-weight: bold; text-transform: uppercase;\">{$this->value}</span><span style=\"font-size: 16px;\">{$text}</span></div>";
    }

    public function flag(): string {
        $emoji = match ($this) {
            self::English => '&#x1F1EC;&#x1F1E7;',
            self::Japanese => '&#x1F1EF;&#x1F1F5;',
            self::French => '&#x1F1EB;&#x1F1F7;',
            self::Spanish => '&#x1F1EA;&#x1F1F8;',
            self::German => '&#x1F1E9;&#x1F1EA;',
        };
        return "<span class=\"lang-flag\" style=\"font-size: 32px;\">{$emoji}</span>";
    }
}
