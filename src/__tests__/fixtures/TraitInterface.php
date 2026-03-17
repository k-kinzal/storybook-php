<?php
namespace App\Components;

interface Displayable {
    public function display(): string;
}

trait HasRender {
    public function render(): string {
        return "<div>" . $this->content() . "</div>";
    }

    public static function factory(string $label): string {
        return "<span>{$label}</span>";
    }
}

abstract class AbstractWidget {
    use HasRender;

    public function __construct(
        protected string $title,
    ) {}

    abstract protected function content(): string;
}

class ConcreteWidget extends AbstractWidget implements Displayable {
    public function __construct(
        string $title,
        private string $body = '',
    ) {
        parent::__construct($title);
    }

    protected function content(): string {
        return "<h3>{$this->title}</h3><p>{$this->body}</p>";
    }

    public function display(): string {
        return $this->render();
    }
}
