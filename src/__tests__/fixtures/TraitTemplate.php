<?php
namespace Tests\Fixtures;

trait HasSection {
    abstract protected function heading(): string;
    abstract protected function body(): string;

    protected function footer(): string {
        return '';
    }

    public function render(): string {
        $footer = $this->footer();
        $footerHtml = $footer !== '' ? "<footer>{$footer}</footer>" : '';
        return "<section><h3>{$this->heading()}</h3><div>{$this->body()}</div>{$footerHtml}</section>";
    }
}

class InfoSection {
    use HasSection;

    public function __construct(
        private string $title,
        private string $content,
        private ?string $note = null,
    ) {}

    protected function heading(): string {
        return $this->title;
    }

    protected function body(): string {
        return "<p>{$this->content}</p>";
    }

    protected function footer(): string {
        return $this->note ?? '';
    }
}
