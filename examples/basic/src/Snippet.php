<?php
namespace App\Components;

/**
 * Demonstrates a class with NO constructor.
 * All arguments are passed directly to the method.
 */
class Snippet {
    public function render(string $code, string $language = 'php', bool $lineNumbers = false): string
    {
        $escaped = htmlspecialchars($code, ENT_QUOTES);

        if ($lineNumbers) {
            $lines = explode("\n", $escaped);
            $numbered = '';
            foreach ($lines as $i => $line) {
                $num = $i + 1;
                $numbered .= "<span style=\"color: #6b7280; user-select: none; margin-right: 16px;\">{$num}</span>{$line}\n";
            }
            $escaped = rtrim($numbered);
        }

        return <<<HTML
        <div class="snippet" style="border-radius: 8px; overflow: hidden; font-family: monospace; font-size: 13px;">
            <div class="snippet-header" style="background: #1e293b; color: #94a3b8; padding: 6px 12px; font-size: 11px; text-transform: uppercase;">{$language}</div>
            <pre style="background: #0f172a; color: #e2e8f0; padding: 16px; margin: 0; overflow-x: auto;"><code>{$escaped}</code></pre>
        </div>
        HTML;
    }

    public function inline(string $code): string
    {
        $escaped = htmlspecialchars($code, ENT_QUOTES);
        return "<code style=\"background: #f1f5f9; color: #0f172a; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px;\">{$escaped}</code>";
    }
}
