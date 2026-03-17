<?php
namespace App\Components;

/**
 * Demonstrates a class with no constructor — methods only.
 * All parameters are passed directly to the method.
 */
class CodeBlock {
    public function render(string $code, string $language = 'php', bool $lineNumbers = false): string
    {
        $lines = explode("\n", htmlspecialchars($code));
        $content = '';
        foreach ($lines as $i => $line) {
            if ($lineNumbers) {
                $num = $i + 1;
                $content .= "<span style=\"color: #6b7280; user-select: none; display: inline-block; width: 2em; text-align: right; margin-right: 1em;\">{$num}</span>";
            }
            $content .= $line . "\n";
        }

        return "<pre class=\"code-block\" style=\"background: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 8px; overflow-x: auto; font-family: 'Fira Code', monospace; font-size: 14px; line-height: 1.6;\"><code class=\"language-{$language}\">{$content}</code></pre>";
    }

    public function inline(string $code): string
    {
        return "<code style=\"background: #f1f5f9; color: #e11d48; padding: 2px 6px; border-radius: 4px; font-family: 'Fira Code', monospace; font-size: 0.9em;\">" . htmlspecialchars($code) . "</code>";
    }
}
