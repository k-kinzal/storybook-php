<?php

namespace App\Components;

class PropertyHook
{
    public string $displayName {
        get => mb_strtoupper($this->displayName);
        set (string $value) => trim($value);
    }

    public int $age {
        set (int $value) => max(0, $value);
    }

    public function __construct(
        string $displayName = 'Guest',
        int $age = 0,
    ) {
        $this->displayName = $displayName;
        $this->age = $age;
    }

    public function render(): string
    {
        return <<<HTML
        <div class="profile-card">
            <h3>{$this->displayName}</h3>
            <p>Age: {$this->age}</p>
        </div>
        HTML;
    }
}
