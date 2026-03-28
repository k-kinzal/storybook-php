<?php
namespace App\Components;

abstract class BaseChip {
    public function __construct(
        protected string $label,
        protected bool $removable = false,
    ) {}

    abstract protected function cssClass(): string;

    public function render(): string {
        $close = $this->removable ? ' <button class="chip-close">&times;</button>' : '';
        $cls = $this->cssClass();
        return "<span class=\"chip chip-{$cls}\">{$this->label}{$close}</span>";
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

class DangerChip extends BaseChip {
    protected function cssClass(): string {
        return 'danger';
    }
}
