<?php
namespace App\Components;

interface Displayable {
    public function display(): string;
}

trait HasContainer {
    public function wrap(string $inner, string $padding = '16px'): string {
        return "<div style=\"padding: {$padding};\">{$inner}</div>";
    }
}

abstract class BaseElement {
    use HasContainer;

    public function __construct(
        protected string $title,
        protected string $variant = 'default',
    ) {}

    abstract protected function body(): string;
}

class ConcreteWidget extends BaseElement implements Displayable {
    public function __construct(
        string $title,
        string $variant = 'default',
        private string $content = '',
        private string $icon = '',
    ) {
        parent::__construct($title, $variant);
    }

    protected function body(): string {
        return "<p>{$this->content}</p>";
    }

    public function display(): string {
        return $this->wrap("<h3>{$this->title}</h3>" . $this->body());
    }

    public function render(): string {
        return $this->display();
    }
}
