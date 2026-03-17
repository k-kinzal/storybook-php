<?php
namespace App\Components;

/**
 * Demonstrates a class with constructor default array values
 * and a generator-based render method with complex iteration.
 */
class Tabs {
    public function __construct(
        private array $tabs = [],
        private int $activeIndex = 0,
        private string $variant = 'default',
    ) {}

    /** @return \Generator<string> */
    public function render(): \Generator {
        if (empty($this->tabs)) {
            yield '<div class="tabs tabs-empty">No tabs defined</div>';
            return;
        }

        yield "<div class=\"tabs tabs-{$this->variant}\">";
        yield '<nav class="tabs-nav" style="display: flex; border-bottom: 2px solid #e5e7eb;">';

        foreach ($this->tabs as $i => $tab) {
            $label = is_array($tab) ? ($tab['label'] ?? "Tab {$i}") : (string) $tab;
            $active = $i === $this->activeIndex;
            $style = $active
                ? 'border-bottom: 2px solid #3b82f6; color: #3b82f6; font-weight: bold;'
                : 'border-bottom: 2px solid transparent; color: #6b7280;';
            yield "<button class=\"tab-btn" . ($active ? ' tab-active' : '') . "\" style=\"padding: 8px 16px; background: none; border: none; cursor: pointer; {$style}\">{$label}</button>";
        }

        yield '</nav>';

        foreach ($this->tabs as $i => $tab) {
            $content = is_array($tab) ? ($tab['content'] ?? '') : '';
            $display = $i === $this->activeIndex ? 'block' : 'none';
            yield "<div class=\"tab-panel\" style=\"display: {$display}; padding: 16px;\">{$content}</div>";
        }

        yield '</div>';
    }
}
