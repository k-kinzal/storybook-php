<?php
namespace App\Components;

/**
 * Demonstrates `string|false` return type - a common PHP pattern.
 */
class SearchResult {
    public function __construct(
        private string $haystack,
    ) {}

    public function findFirst(string $needle): string|false {
        $pos = strpos($this->haystack, $needle);
        if ($pos === false) {
            return false;
        }
        return substr($this->haystack, $pos);
    }

    public function render(string $needle = 'world'): string {
        $found = $this->findFirst($needle);
        if ($found === false) {
            return "<div class=\"search-result\" style=\"padding: 12px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; font-family: system-ui; color: #991b1b;\">
                <strong>Not found:</strong> \"{$needle}\" in \"{$this->haystack}\"
            </div>";
        }
        $highlighted = str_replace($needle, "<mark style=\"background: #fef08a; padding: 0 2px;\">{$needle}</mark>", $found);
        return "<div class=\"search-result\" style=\"padding: 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; font-family: system-ui; color: #166534;\">
            <strong>Found:</strong> {$highlighted}
        </div>";
    }
}
