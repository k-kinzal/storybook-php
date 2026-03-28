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
        $hasNext = $current * 10 < $total;
        $hasPrev = $current > 1;
        $html = '<nav class="pagination pagination-simple">';
        if ($hasPrev) {
            $html .= '<a class="page-prev" href="?page=' . ($current - 1) . '">Previous</a>';
        }
        if ($hasNext) {
            $html .= '<a class="page-next" href="?page=' . ($current + 1) . '">Next</a>';
        }
        $html .= '</nav>';
        return $html;
    }

    public function render(): string
    {
        $totalPages = (int) ceil($this->total / $this->perPage);
        $html = '<nav class="pagination"><ul class="pagination-list">';
        for ($i = 1; $i <= $totalPages; $i++) {
            $active = $i === $this->current ? ' page-active' : '';
            $html .= "<li class=\"page-item{$active}\"><a href=\"?page={$i}\">{$i}</a></li>";
        }
        $html .= '</ul>';
        $html .= "<span class=\"pagination-info\">Page {$this->current} of {$totalPages}</span>";
        $html .= '</nav>';
        return $html;
    }
}
