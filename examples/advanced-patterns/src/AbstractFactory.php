<?php
namespace App\Components;

/**
 * Demonstrates abstract class with static factory methods.
 * The static methods are callable even though the class is abstract,
 * because they don't require instantiation.
 */
abstract class AbstractFactory {
    public function __construct(
        protected string $label,
        protected string $color,
    ) {}

    abstract public function render(): string;

    public static function pill(string $label, string $color = '#3b82f6'): string {
        return "<span class=\"pill\" style=\"display: inline-block; padding: 4px 14px; border-radius: 16px; background: {$color}; color: white; font-size: 13px; font-weight: 600;\">{$label}</span>";
    }

    public static function outline(string $label, string $color = '#3b82f6'): string {
        return "<span class=\"outline\" style=\"display: inline-block; padding: 4px 14px; border-radius: 16px; border: 2px solid {$color}; color: {$color}; font-size: 13px; font-weight: 600;\">{$label}</span>";
    }
}

class ConcreteBadge extends AbstractFactory {
    public function render(): string {
        return "<div class=\"concrete-badge\" style=\"display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: system-ui;\"><span style=\"width: 10px; height: 10px; border-radius: 50%; background: {$this->color};\"></span>{$this->label}</div>";
    }
}
