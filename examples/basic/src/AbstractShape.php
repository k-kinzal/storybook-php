<?php
namespace App\Components;

/**
 * Demonstrates abstract class with concrete subclasses.
 * Each subclass provides its own render() implementation.
 */
abstract class AbstractShape {
    public function __construct(
        protected string $color = '#3b82f6',
        protected int $size = 100,
    ) {}

    abstract public function render(): string;

    protected function style(): string {
        return "width: {$this->size}px; height: {$this->size}px; display: inline-flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;";
    }
}

class Circle extends AbstractShape {
    public function render(): string {
        return "<div class=\"shape shape-circle\" style=\"{$this->style()} background: {$this->color}; border-radius: 50%;\">{$this->size}px</div>";
    }
}

class Square extends AbstractShape {
    public function __construct(
        string $color = '#3b82f6',
        int $size = 100,
        private int $radius = 0,
    ) {
        parent::__construct($color, $size);
    }

    public function render(): string {
        return "<div class=\"shape shape-square\" style=\"{$this->style()} background: {$this->color}; border-radius: {$this->radius}px;\">{$this->size}px</div>";
    }
}
