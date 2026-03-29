<?php
class SimpleWidget {
    public function __construct(private string $label) {}
    public function render(): string {
        return "<widget>{$this->label}</widget>";
    }
}
