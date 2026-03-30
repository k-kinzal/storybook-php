<?php
namespace App\Components;

abstract class BaseElement {
    public function __construct(
        protected string $text,
        protected string $tag = 'div',
    ) {}

    abstract public function render(): string;
}

class StyledElement extends BaseElement {
    public function __construct(
        string $text,
        string $tag = 'div',
        protected string $color = '#374151',
    ) {
        parent::__construct($text, $tag);
    }

    public function render(): string {
        return "<{$this->tag} style=\"color:{$this->color}\">{$this->text}</{$this->tag}>";
    }
}

class InteractiveButton extends StyledElement {
    public function __construct(
        string $text,
        string $color = 'white',
        private string $size = 'md',
        private bool $disabled = false,
    ) {
        parent::__construct($text, 'button', $color);
    }

    public function render(): string {
        $d = $this->disabled ? ' disabled' : '';
        return "<button class=\"btn btn-{$this->size}\" style=\"color:{$this->color}\"{$d}>{$this->text}</button>";
    }
}
