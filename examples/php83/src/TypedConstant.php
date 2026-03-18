<?php

namespace App\Components;

class TypedConstant
{
    public const string LABEL = 'Default';
    public const int MAX_LENGTH = 255;
    public const float TAX_RATE = 0.08;
    public const bool ACTIVE = true;

    public function __construct(
        private string $text = self::LABEL,
        private int $maxLength = self::MAX_LENGTH,
    ) {}

    public function render(): string
    {
        $truncated = mb_substr($this->text, 0, $this->maxLength);
        $rate = self::TAX_RATE * 100;

        return <<<HTML
        <div class="typed-constant">
            <span class="label">{$truncated}</span>
            <span class="meta">max: {$this->maxLength} | tax: {$rate}%</span>
        </div>
        HTML;
    }
}
