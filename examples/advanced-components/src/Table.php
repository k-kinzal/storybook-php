<?php
namespace App\Components;

class Table {
    public function __construct(
        private array $headers,
        private array $rows,
        private bool $striped = false,
    ) {}

    public function render(): string {
        $classes = 'table';
        if ($this->striped) {
            $classes .= ' table-striped';
        }
        $headerCells = implode('', array_map(
            fn(string $h) => "<th>{$h}</th>",
            $this->headers
        ));
        $bodyRows = implode('', array_map(
            fn(array $row) => '<tr>' . implode('', array_map(
                fn(string $cell) => "<td>{$cell}</td>",
                $row
            )) . '</tr>',
            $this->rows
        ));
        return <<<HTML
        <table class="{$classes}" style="border-collapse: collapse; width: 100%;">
            <thead><tr>{$headerCells}</tr></thead>
            <tbody>{$bodyRows}</tbody>
        </table>
        HTML;
    }
}
