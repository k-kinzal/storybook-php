<?php
namespace App\Components;

class FormField {
    private string $id;

    public function __construct(
        public readonly string $label,
        private string $type = 'text',
        ?string $id = null,
        private bool $required = false,
    ) {
        $this->id = $id ?? strtolower(str_replace(' ', '-', $label));
    }

    public function render(): string
    {
        $req = $this->required ? ' required' : '';
        return "<label for=\"{$this->id}\">{$this->label}</label><input id=\"{$this->id}\" type=\"{$this->type}\"{$req}>";
    }
}
