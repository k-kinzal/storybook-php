<?php

declare(strict_types=1);

namespace StorybookPhp\TestFixture\Hydration;

use Countable;
use LogicException;
use ReflectionClass;
use ReflectionFunction;
use ReflectionMethod;
use ReflectionParameter;
use ReflectionProperty;
use stdClass;
use StorybookPhp\TestFixture\{Formatter, FormatterInterface};
use StorybookPhp\TestFixture\Item as AliasItem;
use Traversable;

require_once __DIR__ . '/RunnerFixtures.php';

final class Shaped
{
    /**
     * @param array{foo: AliasItem, count?: int} $shape
     */
    public function __construct(public array $shape)
    {
    }
}

final class Profile
{
    private string $theme = 'light';

    public mixed $meta = null;

    /** @var list<AliasItem> */
    public array $items = [];

    protected ?int $age = null;

    public function __construct(public string $name)
    {
    }

    public function setTheme(string $theme): void
    {
        $this->theme = $theme;
    }

    public function theme(): string
    {
        return $this->theme;
    }

    public function age(): ?int
    {
        return $this->age;
    }
}

final class SetterOnly
{
    private int $value = 0;

    public function setUserValue(int $value): void
    {
        $this->value = $value;
    }

    public function value(): int
    {
        return $this->value;
    }
}

/**
 * @template T
 */
final class TypedCollection
{
    /**
     * @param list<T> $items
     */
    public function __construct(public array $items)
    {
    }
}

final class Pair
{
    public function __construct(public int $x, public int $y = 0)
    {
    }
}

final class Tags
{
    public function __construct(public array $tags, public string $separator = ',')
    {
    }
}

final class Variadic
{
    /** @var list<string> */
    public array $names;

    public function __construct(string ...$names)
    {
        $this->names = array_values($names);
    }
}

final class OptionalNote
{
    public function __construct(public ?string $note)
    {
    }
}

final class Magic
{
    /** @var array<string, mixed> */
    public array $dynamic = [];

    public function __set(string $name, mixed $value): void
    {
        $this->dynamic[$name] = $value;
    }
}

final class PrivateConstructor
{
    private function __construct()
    {
    }
}

abstract class AbstractBlock
{
}

final class ConcreteBlock extends AbstractBlock
{
    public function __construct(public string $content = '')
    {
    }
}

final class Page
{
    public function __construct(
        public FormatterInterface $formatter,
        public mixed $meta = null,
        public AbstractBlock|string|null $block = null,
    ) {
    }

    public function render(string $title, int $limit = 1): string
    {
        return $this->formatter->format($title) . ':' . $limit;
    }
}

final class SelfLinked
{
    public function __construct(public ?self $next = null)
    {
    }
}

final class Container
{
    /**
     * @param TypedCollection<AliasItem> $collection
     * @param Pair[] $pairs
     */
    public function __construct(public TypedCollection $collection, public array $pairs = [])
    {
    }
}

final class Untyped
{
    /**
     * @param FormatterInterface $formatter
     * @param 'draft'|'published' $status
     */
    public function __construct(public $formatter, public $status = 'draft')
    {
    }
}

final class Intersected
{
    public function __construct(public Countable&Traversable $value)
    {
    }
}

final class Widget
{
    public ?string $subtitle = null;

    private string $theme = 'light';

    public function __construct(public string $title)
    {
    }

    public function setTheme(string $theme): void
    {
        $this->theme = $theme;
    }

    /**
     * @param array{foo: AliasItem, count?: int} $shape
     */
    public function render(array $shape, int $limit = 1): string
    {
        return implode(':', [$this->title, $this->subtitle ?? '-', $this->theme, $shape['foo']->label, (string) ($shape['count'] ?? 0), (string) $limit]);
    }
}

/**
 * @param array{foo: AliasItem, extra?: ?string} $shape
 * @return array{foo: AliasItem, extra?: ?string}
 */
function acceptsShape(array $shape): array
{
    return $shape;
}

/**
 * @template T
 * @param T $value
 * @return T
 */
function acceptsTemplate(mixed $value): mixed
{
    return $value;
}

/**
 * @param list<AliasItem>|AliasItem $value
 */
function acceptsArrayOrItem(array|AliasItem $value): array|AliasItem
{
    return $value;
}

/**
 * @param array<string, int> $counts
 */
function acceptsCounts(iterable $counts): iterable
{
    return $counts;
}

/**
 * @param MissingDocType $value
 */
function acceptsMissingDocType(array $value): array
{
    return $value;
}

/**
 * @param list<int $value
 */
function acceptsBrokenDocType(array $value): array
{
    return $value;
}

function acceptsObject(object $value): object
{
    return $value;
}

function acceptsBool(bool $flag, float $ratio = 1.0): string
{
    return ($flag ? 'on' : 'off') . ':' . $ratio;
}

function acceptsFormatter(FormatterInterface $formatter, Formatter ...$fallbacks): FormatterInterface
{
    return $formatter;
}

function acceptsStdClass(stdClass $value): stdClass
{
    return $value;
}

/**
 * Returns the reflection of a function or method parameter without instantiating Reflection inside tests.
 *
 * @param string|array{class-string|object, string} $callable
 */
function parameterOf(string|array $callable, string $name): ReflectionParameter
{
    $function = is_array($callable) ? new ReflectionMethod($callable[0], $callable[1]) : new ReflectionFunction($callable);
    foreach ($function->getParameters() as $parameter) {
        if ($parameter->getName() === $name) {
            return $parameter;
        }
    }

    throw new LogicException("No parameter \${$name}.");
}

/**
 * @param class-string $class
 */
function propertyOf(string $class, string $name): ReflectionProperty
{
    return new ReflectionProperty($class, $name);
}

/**
 * @param class-string $class
 */
function methodOf(string $class, string $name): ReflectionMethod
{
    return new ReflectionMethod($class, $name);
}

/**
 * @param class-string $class
 * @return ReflectionClass<object>
 */
function classOf(string $class): ReflectionClass
{
    return new ReflectionClass($class);
}

function functionOf(string $name): ReflectionFunction
{
    return new ReflectionFunction($name);
}
