<?php
namespace App\Components;

abstract class BaseWidget {
    public function __construct(
        protected string $title = 'Widget',
        protected string $theme = 'light',
    ) {}

    abstract public function render(): string;

    protected function themeStyle(): string {
        return 'some style';
    }
}

class InfoWidget extends BaseWidget {
    public function __construct(
        string $title = 'Info',
        string $theme = 'light',
        protected string $message = '',
    ) {
        parent::__construct($title, $theme);
    }

    public function render(): string {
        return "<div>{$this->title}: {$this->message}</div>";
    }
}

class DetailWidget extends InfoWidget {
    public function __construct(
        string $title = 'Detail',
        string $theme = 'light',
        string $message = '',
        protected string $footer = '',
    ) {
        parent::__construct($title, $theme, $message);
    }

    public function render(): string {
        return "<div>{$this->title}: {$this->message} ({$this->footer})</div>";
    }
}
