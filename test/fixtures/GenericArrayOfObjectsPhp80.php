<?php

namespace App\Fixtures;

class LegacyTag
{
    public string $name;

    public string $color;

    public function __construct(string $name, string $color = 'gray')
    {
        $this->name = $name;
        $this->color = $color;
    }
}

class LegacyTagCloud
{
    /** @var list<LegacyTag> */
    private array $tags;

    /**
     * @phpstan-param list<LegacyTag> $tags
     */
    public function __construct(array $tags, private string $title = 'Tags')
    {
        $this->tags = $tags;
    }

    public function render(): string
    {
        if ($this->tags === []) {
            return "<div class=\"tag-cloud\"><h3>{$this->title}</h3><p>No tags</p></div>";
        }

        $items = implode('', array_map(
            static fn (LegacyTag $tag): string => "<span class=\"tag\" style=\"color: {$tag->color};\">{$tag->name}</span>",
            $this->tags,
        ));

        return "<div class=\"tag-cloud\"><h3>{$this->title}</h3>{$items}</div>";
    }
}
