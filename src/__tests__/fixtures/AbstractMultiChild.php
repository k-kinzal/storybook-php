<?php
namespace App\Fixtures;

abstract class AbstractPanel {
    public function __construct(
        protected string $title,
        protected string $content = '',
    ) {}

    abstract public function render(): string;
}

class InfoPanel extends AbstractPanel {
    public function render(): string {
        return "<div class=\"panel panel-info\"><h3>{$this->title}</h3><p>{$this->content}</p></div>";
    }
}

class WarningPanel extends AbstractPanel {
    public function __construct(
        string $title,
        string $content = '',
        protected string $icon = '!',
    ) {
        parent::__construct($title, $content);
    }

    public function render(): string {
        return "<div class=\"panel panel-warning\"><h3>{$this->icon} {$this->title}</h3><p>{$this->content}</p></div>";
    }
}

class ErrorPanel extends AbstractPanel {
    public function __construct(
        string $title,
        string $content = '',
        protected string $code = '',
    ) {
        parent::__construct($title, $content);
    }

    public function render(): string {
        $codeBlock = $this->code !== '' ? "<code>{$this->code}</code>" : '';
        return "<div class=\"panel panel-error\"><h3>{$this->title}</h3><p>{$this->content}</p>{$codeBlock}</div>";
    }
}
