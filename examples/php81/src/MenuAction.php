<?php
namespace App\Components;

/**
 * Demonstrates an enum implementing multiple interfaces,
 * with both instance and static methods.
 */
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
    case Redo = 'redo';

    public function display(): string {
        return ucfirst($this->value);
    }

    public function shortcut(): string {
        return match ($this) {
            self::Copy  => 'Ctrl+C',
            self::Paste => 'Ctrl+V',
            self::Cut   => 'Ctrl+X',
            self::Undo  => 'Ctrl+Z',
            self::Redo  => 'Ctrl+Y',
        };
    }

    public function menuItem(): string {
        return <<<HTML
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 16px; font-family: system-ui; min-width: 200px; cursor: pointer; border-radius: 4px;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='transparent'">
            <span style="font-size: 14px; color: #111827;">{$this->display()}</span>
            <kbd style="padding: 2px 6px; background: #f9fafb; border: 1px solid #d1d5db; border-radius: 3px; font-size: 11px; color: #6b7280; font-family: system-ui;">{$this->shortcut()}</kbd>
        </div>
        HTML;
    }

    public static function palette(): string {
        $items = '';
        foreach (self::cases() as $case) {
            $items .= $case->menuItem();
        }
        return "<div style=\"padding: 6px 0; border: 1px solid #e5e7eb; border-radius: 8px; background: white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);\">{$items}</div>";
    }
}
