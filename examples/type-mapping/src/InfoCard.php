<?php

namespace App\Components;

/**
 * Concrete card extending BaseCard from a DIFFERENT file.
 *
 * Without typeMap.files[].includes, the vite-plugin can't see BaseCard's
 * constructor params ($title, $variant) because it only searches the same file.
 * typeMap solves this by telling the plugin to also parse BaseCard.php.
 */
class InfoCard extends BaseCard
{
    public function __construct(
        string $title,
        private string $message = '',
        string $variant = 'default',
    ) {
        parent::__construct($title, $variant);
    }

    protected function body(): string
    {
        return "<p style=\"margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;\">{$this->message}</p>";
    }
}
