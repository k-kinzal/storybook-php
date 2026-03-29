<?php
namespace App\Components;

class StringableWrapper implements \Stringable {
    public function __construct(private string $html) {}

    public function __toString(): string {
        return $this->html;
    }
}

enum Badge: string {
    case Info = 'info';
    case Success = 'success';
    case Warning = 'warning';

    public function render(): string {
        return "<span class=\"badge-{$this->value}\">{$this->name}</span>";
    }

    public function toWrapper(): StringableWrapper {
        return new StringableWrapper($this->render());
    }
}

class BadgeHolder {
    public function __construct(
        private Badge $badge = Badge::Info,
    ) {}

    /** Returns a Stringable object */
    public function show(): StringableWrapper {
        return $this->badge->toWrapper();
    }
}
