<?php
namespace App\Components;

class HtmlFragment implements \Stringable {
    public function __construct(private string $html) {}

    public function __toString(): string {
        return $this->html;
    }
}

class Tooltip {
    public function __construct(private string $text) {}

    public function render(string $position = 'top'): HtmlFragment {
        $posStyle = match($position) {
            'top' => 'bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 4px;',
            'bottom' => 'top: 100%; left: 50%; transform: translateX(-50%); margin-top: 4px;',
            'left' => 'right: 100%; top: 50%; transform: translateY(-50%); margin-right: 4px;',
            'right' => 'left: 100%; top: 50%; transform: translateY(-50%); margin-left: 4px;',
            default => 'bottom: 100%; left: 50%; transform: translateX(-50%);',
        };
        return new HtmlFragment(<<<HTML
        <span class="tooltip-wrapper" style="position: relative; display: inline-block;">
            <span class="tooltip tooltip-{$position}" style="position: absolute; {$posStyle} background: #1f2937; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; white-space: nowrap;">{$this->text}</span>
            <span style="display: inline-block; padding: 4px 8px; border: 1px solid #d1d5db; border-radius: 4px;">Hover me</span>
        </span>
        HTML);
    }
}
