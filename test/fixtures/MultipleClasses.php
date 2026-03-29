<?php
namespace App\Components;

class Header {
    public function __construct(private string $title) {}
    public function render(): string {
        return "<header>{$this->title}</header>";
    }
}

class Footer {
    public function __construct(private string $copyright) {}
    public function render(): string {
        return "<footer>{$this->copyright}</footer>";
    }
}
