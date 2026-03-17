<?php

namespace App\Components;

class Pagination {
    public function __construct(
        private int $total,
        private int $perPage = 10,
        private int $current = 1,
    ) {}

    public static function simple(int $total, int $current = 1): string
    {
        return "<nav class=\"pagination-simple\">Page {$current}</nav>";
    }

    public function render(): string
    {
        $totalPages = (int) ceil($this->total / $this->perPage);
        return "<nav class=\"pagination\">Page {$this->current} of {$totalPages}</nav>";
    }
}
