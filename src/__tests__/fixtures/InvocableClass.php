<?php
namespace App\Components;

class Greeting {
    public function __construct(private string $locale = 'en') {}

    public function __invoke(string $name): string {
        return $this->locale === 'ja' ? "<p>こんにちは {$name}</p>" : "<p>Hello {$name}</p>";
    }
}
