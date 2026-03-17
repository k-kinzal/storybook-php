<?php
namespace App\Fixtures;

enum EnumMethodParams: string {
    case Badge = 'badge';
    case Pill = 'pill';
    case Tag = 'tag';

    public function render(string $label, string $color = '#6366f1', int $size = 14, bool $rounded = true): string {
        $radius = $rounded ? '999px' : '4px';
        return "<span class=\"emp-{$this->value}\" style=\"font-size:{$size}px;border-radius:{$radius};color:{$color};\">{$label}</span>";
    }

    public static function showcase(string $label = 'Example'): string {
        $html = '<div class="showcase">';
        foreach (self::cases() as $case) {
            $html .= $case->render($label);
        }
        $html .= '</div>';
        return $html;
    }
}
