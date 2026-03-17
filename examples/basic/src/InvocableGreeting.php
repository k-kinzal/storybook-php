<?php
namespace App\Components;

class InvocableGreeting {
    public function __construct(private string $locale = 'en') {}

    public function __invoke(string $name): string {
        return match($this->locale) {
            'ja' => "<p>こんにちは {$name}</p>",
            'fr' => "<p>Bonjour {$name}</p>",
            default => "<p>Hello {$name}</p>",
        };
    }
}
