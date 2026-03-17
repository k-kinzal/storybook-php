<?php
namespace App\Helpers;

function pill(string $text, bool $outline = false): string {
    $cls = $outline ? 'pill pill-outline' : 'pill';
    return "<span class=\"{$cls}\">{$text}</span>";
}
