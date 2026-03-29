<?php
namespace App\Components;

class NowdocCard {
    public function __construct(
        private string $title = 'Card',
        private string $body = 'Content goes here.',
        private string $variant = 'default',
    ) {}

    public function render(): string {
        $template = <<<'NOWDOC'
<div class="card">%TITLE%: %BODY%</div>
NOWDOC;
        return str_replace(
            ['%TITLE%', '%BODY%'],
            [$this->title, $this->body],
            $template,
        );
    }
}
