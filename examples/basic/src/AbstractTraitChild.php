<?php
namespace App\Components;

/**
 * Demonstrates method resolution through an abstract parent with a trait.
 * The concrete child class inherits the render method from the trait
 * through the abstract parent, testing the findMethodInHierarchy resolution:
 * ConcreteChild → AbstractParent → Trait.
 */
trait HasCardLayout {
    public function render(): string {
        $content = $this->content();
        $footer = $this->footer();
        $footerHtml = $footer !== '' ? "<div style=\"padding: 10px 16px; border-top: 1px solid #e5e7eb; font-size: 13px; color: #6b7280;\">{$footer}</div>" : '';

        return <<<HTML
        <div class="layout-card" style="border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; font-family: system-ui;">
            <div style="padding: 16px;">{$content}</div>
            {$footerHtml}
        </div>
        HTML;
    }
}

abstract class AbstractLayoutCard {
    use HasCardLayout;

    public function __construct(
        protected string $title,
    ) {}

    abstract protected function content(): string;

    protected function footer(): string {
        return '';
    }
}

class ArticleCard extends AbstractLayoutCard {
    public function __construct(
        string $title,
        private string $excerpt = '',
        private string $author = 'Anonymous',
    ) {
        parent::__construct($title);
    }

    protected function content(): string {
        $excerptHtml = $this->excerpt !== '' ? "<p style=\"color: #6b7280; margin: 8px 0 0; font-size: 14px;\">{$this->excerpt}</p>" : '';
        return "<h3 style=\"margin: 0; font-size: 16px;\">{$this->title}</h3>{$excerptHtml}";
    }

    protected function footer(): string {
        return "By {$this->author}";
    }
}

class QuoteCard extends AbstractLayoutCard {
    public function __construct(
        string $title,
        private string $quote,
        private string $source = '',
    ) {
        parent::__construct($title);
    }

    protected function content(): string {
        $sourceHtml = $this->source !== '' ? "<cite style=\"display: block; margin-top: 8px; color: #6b7280; font-size: 13px;\">&mdash; {$this->source}</cite>" : '';
        return "<h4 style=\"margin: 0 0 8px; font-size: 14px; color: #6b7280;\">{$this->title}</h4><blockquote style=\"margin: 0; font-style: italic; font-size: 15px; color: #374151;\">&ldquo;{$this->quote}&rdquo;{$sourceHtml}</blockquote>";
    }
}
