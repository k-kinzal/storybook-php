<?php
namespace App\Components;

trait HasShareLink {
    public function shareLink(string $url, string $label = 'Share'): string {
        return "<a class=\"share-link\" href=\"{$url}\">{$label}</a>";
    }
}

trait HasSocialIcon {
    abstract public function icon(): string;
}

class TwitterShare {
    use HasShareLink, HasSocialIcon;

    public function __construct(private string $handle = '') {}

    public function icon(): string { return 'X'; }
}

class FacebookShare {
    use HasShareLink, HasSocialIcon;

    public function __construct(private string $appId = '') {}

    public function icon(): string { return 'FB'; }
}
