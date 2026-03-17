<?php
namespace App\Components;

/**
 * Demonstrates multiple traits providing different render methods.
 * The Vite plugin finds methods via trait traversal within the same file.
 */
trait HasShareLink {
    public function shareLink(string $url, string $label = 'Share'): string {
        $platform = strtolower((new \ReflectionClass($this))->getShortName());
        return "<a class=\"share-link share-{$platform}\" href=\"{$url}\" style=\"display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 6px; background: {$this->color()}; color: white; text-decoration: none; font-size: 13px; font-weight: 600;\">{$this->icon()} {$label}</a>";
    }
}

trait HasIcon {
    abstract public function icon(): string;
}

class Twitter {
    use HasShareLink, HasIcon;

    public function __construct(private string $handle = '') {}

    public function icon(): string {
        return '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>';
    }

    public function color(): string {
        return '#000000';
    }
}

class Facebook {
    use HasShareLink, HasIcon;

    public function __construct(private string $appId = '') {}

    public function icon(): string {
        return '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>';
    }

    public function color(): string {
        return '#1877F2';
    }
}
