<?php
namespace App\Components;

class RuntimeInheritedDefaults {
    public function __construct(
        private string $name,
        private string $greeting = 'Hello',
        private bool $enabled = false,
        private array $tags = ['alpha', 'beta'],
    ) {}

    public function render(string $suffix = '!'): string {
        $enabled = $this->enabled ? 'true' : 'false';
        $tagText = implode(',', $this->tags);

        return "<div data-greeting=\"{$this->greeting}\" data-enabled=\"{$enabled}\" data-tags=\"{$tagText}\">{$this->greeting}, {$this->name}{$suffix}</div>";
    }
}

function runtimeInheritedDefaultsBadge(
    string $label,
    string $color = 'gray',
    array $tags = ['one', 'two'],
    bool $outlined = false,
): string {
    $outlineClass = $outlined ? ' outlined' : '';
    $tagText = implode(',', $tags);

    return "<span class=\"badge badge-{$color}{$outlineClass}\" data-tags=\"{$tagText}\">{$label}</span>";
}
