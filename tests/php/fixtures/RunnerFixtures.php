<?php

declare(strict_types=1);

namespace StorybookPhp\TestFixture;

interface FormatterInterface
{
    public function format(string $value): string;
}

final class Formatter implements FormatterInterface
{
    public function __construct(private string $prefix = '')
    {
    }

    public function format(string $value): string
    {
        return $this->prefix . strtoupper($value);
    }
}

final class Item
{
    public function __construct(public string $label)
    {
    }
}

final class NoConstructorItem
{
    public string $label = 'generated';
}

final class StringableValue
{
    public function __construct(private string $value)
    {
    }

    public function __toString(): string
    {
        return $this->value;
    }
}

interface ListCollectionContract
{
    /** @return list<Item> */
    public function items(): array;
}

final class ListCollection implements ListCollectionContract
{
    /**
     * @param list<Item> $items
     */
    public function __construct(public array $items)
    {
    }

    /** @return list<Item> */
    public function items(): array
    {
        return $this->items;
    }
}

final class NoConstructorCollection
{
    /** @var list<Item> */
    public array $items = [];
}

abstract class AbstractCollection
{
    /** @var list<Item> */
    public array $items = [];
}

final class BrokenCollection
{
    /**
     * @param list<Item> $items
     */
    public function __construct(public array $items, public string $name)
    {
    }
}

final class SelfReferencing
{
    public function acceptsSelf(self $value): self
    {
        return $value;
    }
}

final class ExampleRenderer
{
    public function __construct(public int $id, public ?Item $item = null)
    {
    }

    /**
     * @phpstan-param list<Item> $items
     */
    public function render(string $title, array $items, int $count = 1): string
    {
        echo 'buffer:';

        return $title . ':' . $count . ':' . $items[0]->label . ':' . ($this->item?->label ?? 'none');
    }

    public static function staticRender(float $amount): array
    {
        return ['html' => 'static:' . $amount];
    }
}

final class NoConstructorRenderer
{
    public function render(): string
    {
        echo 'plain-buffer:';

        return 'plain';
    }
}

/**
 * @param list<string> $values
 * @psalm-param list<int> $values
 * @phpstan-param list<float> $values
 */
function docPriority(array $values): void
{
}

/**
 * @param list<string> $values
 * @psalm-param list<int> $values
 */
function psalmPriority(array $values): void
{
}

/**
 * @param list<string> $values
 */
function paramOnly(array $values): void
{
}

function noDocBlock(array $values): void
{
}

/**
 * @phpstan-param list<Item> $items
 */
function renderFixture(string $title, array $items, ?FormatterInterface $formatter = null, int ...$numbers): string
{
    echo 'func:';

    $formatted = $formatter instanceof \StorybookPhp\TestFixture\FormatterInterface ? $formatter->format($title) : $title;

    return $formatted . ':' . $items[0]->label . ':' . implode(',', $numbers);
}

/**
 * @phpstan-param list<Item> $items
 */
function acceptsItems(array $items): array
{
    return $items;
}

/**
 * @phpstan-param list<list<Item>> $groups
 */
function acceptsNestedItems(array $groups): array
{
    return $groups;
}

/**
 * @phpstan-param list<NoConstructorItem> $items
 */
function acceptsNoConstructorItems(array $items): array
{
    return $items;
}

/**
 * @phpstan-param list<Item|StringableValue> $values
 */
function acceptsUnionItems(array $values): array
{
    return $values;
}

/**
 * @phpstan-param ListCollection<Item> $collection
 */
function acceptsCollection(ListCollection $collection): ListCollection
{
    return $collection;
}

function acceptsItem(Item $item): Item
{
    return $item;
}

function acceptsNoConstructor(NoConstructorItem $item): NoConstructorItem
{
    return $item;
}

function acceptsFormatter(FormatterInterface $formatter): FormatterInterface
{
    return $formatter;
}

function acceptsObject(object $value): object
{
    return $value;
}

final class OverrideTarget
{
    public function __construct(
        public int $limit,
        public $subtitle,
    ) {
    }
}

/**
 * @phpstan-param list<Item> $value
 */
function acceptsIterable(iterable $value): iterable
{
    return $value;
}

function acceptsCallable(callable $value): callable
{
    return $value;
}

function acceptsMixed(mixed $value): mixed
{
    return $value;
}

function acceptsNullable(?string $value): ?string
{
    return $value;
}

function acceptsNullableNoDefault(?string $value): ?string
{
    return $value;
}

/**
 * @return array{0: string, 1: ?string, 2: list<int>}
 */
function acceptsDefault(string $value = 'fallback', ?string $optional = null, int ...$numbers): array
{
    return [$value, $optional, $numbers];
}

function acceptsUntyped($value)
{
    return $value;
}
