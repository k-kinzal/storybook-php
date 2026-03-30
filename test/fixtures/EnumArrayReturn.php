<?php
namespace App\Components;

enum EnumArrayReturn: string {
    case Success = 'success';
    case Warning = 'warning';
    case Error = 'error';

    public function card(string $message = ''): array {
        $text = $message !== '' ? $message : "A {$this->value} message.";
        return [
            'html' => "<div class=\"enum-card-{$this->value}\">{$text}</div>",
        ];
    }
}
