<?php
namespace App\Components;

use Attribute;

#[Attribute]
class MyAttr {
    public function __construct(public string $name = '') {}
}

class AttributeClass {
    public function __construct(
        #[MyAttr(name: 'title')]
        private string $title,
        #[MyAttr(name: 'body')]
        private string $body = '',
    ) {}

    #[Override]
    public function render(): string {
        return "<div>{$this->title}: {$this->body}</div>";
    }
}
