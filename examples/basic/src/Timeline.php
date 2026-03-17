<?php

namespace App\Components;

/**
 * Demonstrates a class that returns an array with 'html' key.
 * The runner resolves this to HTML via the resolveOutput() function.
 */
class Timeline {
    public function __construct(
        private array $events = [],
        private bool $reversed = false,
    ) {}

    public function render(): array
    {
        $items = $this->reversed ? array_reverse($this->events) : $this->events;

        if (empty($items)) {
            return ['html' => '<div class="timeline timeline-empty">No events</div>'];
        }

        $html = '<div class="timeline">';
        foreach ($items as $i => $event) {
            $date = is_array($event) ? ($event['date'] ?? '') : '';
            $title = is_array($event) ? ($event['title'] ?? '') : (string) $event;
            $desc = is_array($event) ? ($event['description'] ?? '') : '';
            $pos = $i % 2 === 0 ? 'left' : 'right';
            $html .= "<div class=\"timeline-item timeline-{$pos}\">";
            if ($date !== '') {
                $html .= "<span class=\"timeline-date\">{$date}</span>";
            }
            $html .= "<h3 class=\"timeline-title\">{$title}</h3>";
            if ($desc !== '') {
                $html .= "<p class=\"timeline-desc\">{$desc}</p>";
            }
            $html .= '</div>';
        }
        $html .= '</div>';

        return ['html' => $html];
    }
}
