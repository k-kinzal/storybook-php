<?php
namespace App\UI\Components\Form;

class TextInput {
    public function __construct(
        private string $name,
        private string $label = '',
        private string $placeholder = '',
        private bool $required = false,
    ) {}

    public function render(): string {
        $label = $this->label ?: ucfirst($this->name);
        $req = $this->required ? ' <span style="color:red;">*</span>' : '';
        return "<div class=\"form-group\"><label>{$label}{$req}</label><input type=\"text\" name=\"{$this->name}\" placeholder=\"{$this->placeholder}\"></div>";
    }
}
