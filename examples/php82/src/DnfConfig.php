<?php
namespace App\Components;

/**
 * Demonstrates PHP 8.2 DNF (Disjunctive Normal Form) types: (A&B)|C.
 * The constructor uses a DNF type parameter alongside regular typed params.
 */
interface Loggable {
    public function toLog(): string;
}

interface Serializable {
    public function serialize(): string;
}

class DnfConfig {
    public function __construct(
        private string $name,
        private (Loggable&Serializable)|string $source = 'default',
        private bool $debug = false,
    ) {}

    public function render(): string {
        $sourceText = is_string($this->source) ? $this->source : $this->source->toLog();
        $debugBadge = $this->debug
            ? '<span style="display: inline-block; padding: 2px 6px; background: #fef3c7; color: #92400e; border-radius: 4px; font-size: 10px; font-weight: 600; margin-left: 8px;">DEBUG</span>'
            : '';

        return <<<HTML
        <div style="padding: 14px 18px; background: #fafafa; border: 1px solid #e5e7eb; border-radius: 8px; font-family: monospace; font-size: 13px;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="font-weight: 700; color: #111827;">{$this->name}</span>{$debugBadge}
            </div>
            <div style="color: #6b7280;">
                <span style="color: #9ca3af;">source:</span> {$sourceText}
            </div>
        </div>
        HTML;
    }
}
