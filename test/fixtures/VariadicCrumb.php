<?php
namespace App\Components;

class VariadicCrumb {
    private array $segments;

    public function __construct(
        private string $separator = ' / ',
        string ...$segments,
    ) {
        $this->segments = $segments;
    }

    public function render(): string {
        if (empty($this->segments)) {
            return '<nav>No breadcrumbs</nav>';
        }
        return '<nav>' . implode($this->separator, $this->segments) . '</nav>';
    }
}
