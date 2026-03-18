<?php
namespace App\Components;

/**
 * Demonstrates trait usage where a class method comes from a trait.
 * The vite plugin resolves methods through trait hierarchies.
 */
trait HasToggle {
    public function toggle(string $label, string $content, bool $open = false): string {
        $openAttr = $open ? ' open' : '';
        return "<details class=\"accordion-item\" style=\"border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 8px; overflow: hidden;\"{$openAttr}><summary style=\"padding: 12px 16px; cursor: pointer; font-weight: 600; background: #f9fafb; user-select: none;\">{$label}</summary><div style=\"padding: 12px 16px; border-top: 1px solid #e5e7eb;\">{$content}</div></details>";
    }
}

trait HasTooltip {
    public function tooltip(string $text, string $tip = 'More info'): string {
        return "<span class=\"tooltip-wrapper\" style=\"position: relative; border-bottom: 1px dotted #6b7280; cursor: help;\" title=\"{$tip}\">{$text}</span>";
    }
}

class AccordionPanel {
    use HasToggle;

    public function __construct(private string $theme = 'default') {}
}

class RichWidget {
    use HasToggle, HasTooltip;

    public function __construct(private string $title = 'Widget') {}
}
