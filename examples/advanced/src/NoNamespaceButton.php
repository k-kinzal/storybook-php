<?php
class NoNamespaceButton {
    public function __construct(
        private string $label,
        private string $variant = 'default',
        private bool $disabled = false,
    ) {}

    public function render(): string {
        $cls = "btn btn-{$this->variant}";
        $disabled = $this->disabled ? ' disabled' : '';
        $opacity = $this->disabled ? 'opacity: 0.5;' : '';
        return "<button class=\"{$cls}\"{$disabled} style=\"padding: 8px 16px; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; font-size: 14px; {$opacity}\">{$this->label}</button>";
    }
}
