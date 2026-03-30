<?php
namespace App\Components;

interface Displayable {
    public function display(): string;
}

interface Accessible {
    public function shortcut(): string;
}

enum MenuAction: string implements Displayable, Accessible {
    case Copy = 'copy';
    case Paste = 'paste';
    case Cut = 'cut';
    case Undo = 'undo';

    public function display(): string {
        return ucfirst($this->value);
    }

    public function shortcut(): string {
        return match ($this) {
            self::Copy  => 'Ctrl+C',
            self::Paste => 'Ctrl+V',
            self::Cut   => 'Ctrl+X',
            self::Undo  => 'Ctrl+Z',
        };
    }

    public function menuItem(): string {
        return "<span class=\"menu-item\">{$this->display()} ({$this->shortcut()})</span>";
    }

    public static function palette(): string {
        $items = '';
        foreach (self::cases() as $case) {
            $items .= $case->menuItem();
        }
        return "<div class=\"palette\">{$items}</div>";
    }
}
