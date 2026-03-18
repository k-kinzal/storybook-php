<?php
namespace App\Components;

/**
 * Demonstrates an enum with methods that take array-typed parameters.
 * Tests enum method parameter parsing with complex types.
 */
enum ListStyle: string {
    case Bullet = 'disc';
    case Number = 'decimal';
    case Dash = 'square';
    case None = 'none';

    public function renderList(array $items, string $title = ''): string {
        $tag = $this === self::Number ? 'ol' : 'ul';
        $header = $title !== '' ? "<h4 style=\"margin: 0 0 8px; font-family: system-ui; color: #374151;\">{$title}</h4>" : '';
        $lis = implode('', array_map(
            fn($i) => "<li style=\"padding: 2px 0;\">{$i}</li>",
            $items
        ));
        return <<<HTML
        <div style="font-family: system-ui;">
            {$header}
            <{$tag} style="list-style: {$this->value}; margin: 0; padding-left: 24px; color: #374151;">
                {$lis}
            </{$tag}>
        </div>
        HTML;
    }

    public static function preview(array $items): string {
        $html = '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; font-family: system-ui;">';
        foreach (self::cases() as $case) {
            $html .= "<div style=\"padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px;\">";
            $html .= $case->renderList($items, $case->name);
            $html .= "</div>";
        }
        $html .= '</div>';
        return $html;
    }
}
