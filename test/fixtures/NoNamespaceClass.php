<?php
class NoNamespaceButton {
    public function __construct(
        private string $label,
        private string $variant = 'default',
        private bool $disabled = false,
    ) {}

    public function render(): string {
        return "<button class=\"btn btn-{$this->variant}\">{$this->label}</button>";
    }
}
