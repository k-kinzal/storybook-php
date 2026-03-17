<?php
namespace App\Fixtures;

/**
 * Demonstrates PHP 8.2 standalone types: true, false, null.
 */
class StandaloneTypes {
    public function __construct(
        private string $label,
        private true $enabled = true,
        private false $hidden = false,
    ) {}

    public function render(): string {
        $vis = $this->hidden === false ? 'visible' : 'hidden';
        $state = $this->enabled === true ? 'enabled' : 'disabled';
        return "<div class=\"standalone-{$state}\" style=\"visibility: {$vis};\">{$this->label}</div>";
    }
}
