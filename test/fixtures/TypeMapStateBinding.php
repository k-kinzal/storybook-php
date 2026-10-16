<?php

namespace App\Components;

use App\Components\State\Badge as StateBadge;

interface StateTheme
{
    public function name(): string;
}

final class DarkTheme implements StateTheme
{
    public function __construct(private string $accent = 'blue')
    {
    }

    public function name(): string
    {
        return 'dark-' . $this->accent;
    }
}

final class LightTheme implements StateTheme
{
    public function name(): string
    {
        return 'light';
    }
}

/**
 * Component whose state is set through the constructor, a setter, and a public property.
 */
final class StatefulCard
{
    public ?string $subtitle = null;

    public mixed $meta = null;

    private StateTheme $theme;

    private string $density = 'normal';

    public function __construct(public string $title)
    {
        $this->theme = new LightTheme();
    }

    public function setTheme(StateTheme $theme): void
    {
        $this->theme = $theme;
    }

    public function setDensity(string $density): void
    {
        $this->density = $density;
    }

    /**
     * @param array{badge: StateBadge, count?: int} $shape
     */
    public function render(array $shape, int $limit = 1): string
    {
        $meta = is_array($this->meta) ? json_encode($this->meta) : 'none';

        return sprintf(
            '<article class="%s %s"><h2>%s</h2><p>%s</p><span>%s x%d</span><em>%d</em><code>%s</code></article>',
            $this->theme->name(),
            $this->density,
            $this->title,
            $this->subtitle ?? '',
            $shape['badge']->label,
            $shape['count'] ?? 0,
            $limit,
            $meta,
        );
    }
}

namespace App\Components\State;

final class Badge
{
    public function __construct(public string $label)
    {
    }
}
