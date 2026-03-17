<?php
namespace App\Components;

abstract class BaseChip {
    public function __construct(
        protected string $label,
        protected bool $removable = false,
    ) {}

    abstract protected function cssClass(): string;

    public function render(): string {
        $close = $this->removable ? ' <button>&times;</button>' : '';
        return "<span class=\"chip chip-{$this->cssClass()}\">{$this->label}{$close}</span>";
    }
}

class InfoChip extends BaseChip {
    protected function cssClass(): string {
        return 'info';
    }
}

class SuccessChip extends BaseChip {
    protected function cssClass(): string {
        return 'success';
    }
}
