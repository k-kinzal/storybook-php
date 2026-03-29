<?php
namespace App\Fixtures;

enum ListStyle: string {
    case Bullet = 'disc';
    case Number = 'decimal';
    case None = 'none';

    public function renderList(array $items, string $class = ''): string {
        $tag = $this === self::Number ? 'ol' : 'ul';
        $cls = $class !== '' ? " class=\"{$class}\"" : '';
        $lis = implode('', array_map(fn($i) => "<li>{$i}</li>", $items));
        return "<{$tag} style=\"list-style: {$this->value};\"{$cls}>{$lis}</{$tag}>";
    }

    public static function preview(array $items): string {
        $html = '';
        foreach (self::cases() as $case) {
            $html .= "<div><strong>{$case->name}:</strong>" . $case->renderList($items) . "</div>";
        }
        return $html;
    }
}
