<?php
namespace App\Fixtures;

class Tag {
    public function __construct(
        public readonly string $name,
        public readonly string $color = 'gray',
    ) {}
}

class TagCloud {
    /** @var Tag[] */
    private array $tags;

    /**
     * @phpstan-param list<Tag> $tags
     */
    public function __construct(
        array $tags,
        private string $title = 'Tags',
    ) {
        $this->tags = $tags;
    }

    public function render(): string {
        if (empty($this->tags)) {
            return "<div class=\"tag-cloud\"><h3>{$this->title}</h3><p>No tags</p></div>";
        }
        $items = implode('', array_map(
            fn(Tag $tag) => "<span class=\"tag\" style=\"color: {$tag->color};\">{$tag->name}</span>",
            $this->tags,
        ));
        return "<div class=\"tag-cloud\"><h3>{$this->title}</h3>{$items}</div>";
    }
}

class TagBoard {
    /** @var list<list<Tag>> */
    private array $groups;

    /**
     * @phpstan-param list<list<Tag>> $groups
     */
    public function __construct(
        array $groups,
        private string $title = 'Board',
    ) {
        $this->groups = $groups;
    }

    public function render(): string {
        $sections = '';
        foreach ($this->groups as $i => $group) {
            $items = implode('', array_map(
                fn(Tag $tag) => "<span class=\"tag\">{$tag->name}</span>",
                $group,
            ));
            $sections .= "<div class=\"group\" data-group=\"{$i}\">{$items}</div>";
        }
        return "<div class=\"tag-board\"><h3>{$this->title}</h3>{$sections}</div>";
    }
}

class TagList {
    /** @var Tag[] */
    private array $tags;

    /**
     * @param Tag[] $tags
     */
    public function __construct(
        array $tags,
    ) {
        $this->tags = $tags;
    }

    public function render(): string {
        $items = implode('', array_map(
            fn(Tag $tag) => "<li>{$tag->name}</li>",
            $this->tags,
        ));
        return "<ul>{$items}</ul>";
    }
}
