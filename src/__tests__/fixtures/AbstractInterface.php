<?php
namespace App\Components;

interface Renderable {
    public function render(): string;
}

abstract class AbstractPanel implements Renderable {
    public function __construct(
        protected string $title,
    ) {}

    public static function types(): string {
        return 'info, warning';
    }
}

class InfoPanel extends AbstractPanel {
    public function __construct(
        string $title,
        private string $body = '',
    ) {
        parent::__construct($title);
    }

    public function render(): string {
        return "<div class=\"panel\"><h3>{$this->title}</h3><p>{$this->body}</p></div>";
    }
}
