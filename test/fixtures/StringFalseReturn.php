<?php
namespace App\Components;

/**
 * Demonstrates the common PHP pattern of `string|false` return type.
 * Also tests `string|null` and `int|false` patterns.
 */
class StringFalseReturn {
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
            return "<div class=\"search-result not-found\">Not found: {$needle}</div>";
        }
        return "<div class=\"search-result found\">Found: {$found}</div>";
    }
}
