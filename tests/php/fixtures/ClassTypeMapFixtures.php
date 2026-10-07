<?php

declare(strict_types=1);

namespace StorybookPhp\TestFixture\ClassTypeMap;

final class Leaf
{
    /**
     * @param array<array-key, mixed> $tags
     */
    public function __construct(public array $tags)
    {
    }
}

final class Branch
{
    /**
     * @param array<array-key, mixed> $leaves
     */
    public function __construct(public array $leaves)
    {
    }
}

final class Tree
{
    /**
     * @param array<array-key, mixed> $branches
     */
    public function __construct(public array $branches)
    {
    }

    public function render(): string
    {
        $parts = [];
        foreach ($this->branches as $branch) {
            $leaves = $branch instanceof Branch ? $branch->leaves : [];
            $parts[] = implode(',', array_map(
                static fn (mixed $leaf): string => $leaf instanceof Leaf ? implode('/', $leaf->tags) : 'raw',
                $leaves,
            ));
        }

        return implode('|', $parts);
    }
}

class BaseShelf
{
    /**
     * @param array<array-key, mixed> $items
     */
    public function __construct(public array $items = [], public string $label = '')
    {
    }
}

class Shelf extends BaseShelf
{
    /**
     * @param array<array-key, mixed> $items
     */
    public function __construct(array $items = [], string $label = '')
    {
        parent::__construct($items, $label);
    }
}

final class LabeledShelf extends Shelf
{
}

final class Holder
{
    /**
     * @param mixed $item
     */
    public function __construct(public $item)
    {
    }
}

final class Empty_
{
}
