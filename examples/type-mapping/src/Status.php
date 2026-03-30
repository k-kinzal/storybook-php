<?php

namespace App\Components;

/**
 * Backed enum — typeMap.files[*].args provides case values as options.
 */
enum Status: string
{
    case Active = 'active';
    case Inactive = 'inactive';
    case Pending = 'pending';
    case Archived = 'archived';

    public function badge(): string
    {
        $colors = [
            'active'   => '#22c55e',
            'inactive' => '#6b7280',
            'pending'  => '#f59e0b',
            'archived' => '#94a3b8',
        ];
        $color = $colors[$this->value] ?? '#6b7280';
        return "<span style=\"display: inline-block; padding: 4px 12px; border-radius: 12px; background: {$color}; color: white; font-size: 13px; font-family: system-ui;\">{$this->name}</span>";
    }
}
