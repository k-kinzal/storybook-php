<?php
namespace App\Components;

interface Loggable {
    public function toLog(): string;
}

interface DnfSerializable {
    public function serialize(): string;
}

class DnfConfig {
    public function __construct(
        private string $name,
        private (Loggable&DnfSerializable)|string $source = 'default',
        private bool $debug = false,
    ) {}

    public function render(): string {
        $src = is_string($this->source) ? $this->source : $this->source->toLog();
        $d = $this->debug ? ' [DEBUG]' : '';
        return "<div class=\"config\">{$this->name}: {$src}{$d}</div>";
    }
}
