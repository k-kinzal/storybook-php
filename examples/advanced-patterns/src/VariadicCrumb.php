<?php
namespace App\Components;

/**
 * Demonstrates variadic string parameters in the constructor.
 * The runner maps array args to variadic params via spread.
 */
class VariadicCrumb {
    /** @var string[] */
    private array $segments;

    public function __construct(
        private string $separator = ' / ',
        string ...$segments,
    ) {
        $this->segments = $segments;
    }

    public function render(): string {
        if (empty($this->segments)) {
            return '<nav class="crumb" style="font-family: system-ui; color: #9ca3af; font-size: 14px;">No breadcrumbs</nav>';
        }

        $last = count($this->segments) - 1;
        $parts = [];
        foreach ($this->segments as $i => $seg) {
            if ($i === $last) {
                $parts[] = "<span style=\"color: #111827; font-weight: 600;\">{$seg}</span>";
            } else {
                $parts[] = "<a href=\"#\" style=\"color: #3b82f6; text-decoration: none;\">{$seg}</a>";
            }
        }

        $sep = "<span style=\"color: #d1d5db; margin: 0 4px;\">{$this->separator}</span>";
        return '<nav class="crumb" style="font-family: system-ui; font-size: 14px;">' . implode($sep, $parts) . '</nav>';
    }
}
