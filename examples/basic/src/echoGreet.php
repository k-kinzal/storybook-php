<?php
namespace App\Helpers;

/**
 * Demonstrates a standalone function that uses echo instead of return.
 * The runner captures echo output via output buffering.
 */
function echoGreet(string $name, string $style = 'banner'): void {
    $styles = [
        'banner' => 'padding: 16px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; font-size: 18px;',
        'inline' => 'padding: 4px 8px; background: #f3f4f6; color: #374151; border-radius: 4px; font-size: 14px;',
        'toast'  => 'padding: 10px 16px; background: #1f2937; color: #f9fafb; border-radius: 6px; font-size: 13px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);',
    ];
    $css = $styles[$style] ?? $styles['banner'];

    echo "<div class=\"echo-greet echo-greet-{$style}\" style=\"display: inline-block; font-family: system-ui; {$css}\">";
    echo "Hello, <strong>{$name}</strong>!";
    echo "</div>";
}
