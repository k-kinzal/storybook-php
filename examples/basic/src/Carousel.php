<?php
namespace App\Components;

/**
 * Demonstrates variadic constructor parameters
 * and __toString return via a Stringable value object.
 */
class Slide {
    public function __construct(
        public readonly string $content,
        public readonly string $caption = '',
    ) {}

    public function __toString(): string
    {
        $captionHtml = $this->caption !== '' ? "<p class=\"slide-caption\">{$this->caption}</p>" : '';
        return "<div class=\"slide\"><div class=\"slide-content\">{$this->content}</div>{$captionHtml}</div>";
    }
}

class Carousel {
    /** @var Slide[] */
    private array $slides;

    public function __construct(
        private int $activeIndex = 0,
        private bool $autoplay = false,
        Slide ...$slides,
    ) {
        $this->slides = $slides;
    }

    public function render(string ...$items): string
    {
        // Merge constructor slides with render-time items
        $allSlides = $this->slides;
        foreach ($items as $item) {
            $allSlides[] = new Slide($item);
        }

        if (empty($allSlides)) {
            return '<div class="carousel carousel-empty">No slides</div>';
        }

        $count = count($allSlides);
        $active = max(0, min($this->activeIndex, $count - 1));
        $autoAttr = $this->autoplay ? ' data-autoplay="true"' : '';

        $html = "<div class=\"carousel\"{$autoAttr}>";
        $html .= '<div class="carousel-slides">';
        foreach ($allSlides as $i => $slide) {
            $cls = $i === $active ? 'carousel-slide carousel-active' : 'carousel-slide';
            $html .= "<div class=\"{$cls}\">{$slide}</div>";
        }
        $html .= '</div>';
        $html .= "<div class=\"carousel-nav\">Slide " . ($active + 1) . " of {$count}</div>";
        $html .= '</div>';
        return $html;
    }
}
