<?php
namespace Tests\Fixtures;

class StaticEcho {
    public static function banner(string $title, string $color = '#3b82f6'): void {
        echo "<div class=\"banner\" style=\"background:{$color}\">{$title}</div>";
    }

    public static function notice(string $message, string $type = 'info'): void {
        echo "<div class=\"notice notice-{$type}\">{$message}</div>";
    }
}
