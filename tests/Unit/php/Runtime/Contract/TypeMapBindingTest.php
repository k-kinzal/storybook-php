<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Contract;

use PHPUnit\Framework\TestCase;
use StorybookPhp\Runtime\Contract\HydrationException;

/**
 * @covers \StorybookPhp\Runtime\Contract\normalizeTypeMapBindings
 * @covers \StorybookPhp\Runtime\Contract\parseBindingKey
 * @covers \StorybookPhp\Runtime\Contract\normalizeBindingValue
 * @covers \StorybookPhp\Runtime\Contract\boundTypeName
 * @covers \StorybookPhp\Runtime\Contract\slotBinding
 * @covers \StorybookPhp\Runtime\Contract\HydrationException
 */
final class TypeMapBindingTest extends TestCase
{
    public function testNormalizesTypeAndSlotBindings(): void
    {
        $bindings = \StorybookPhp\Runtime\Contract\normalizeTypeMapBindings(['bindings' => [
            '\App\Renderable' => '\App\HtmlBlock',
            'App\Card::$meta' => ['value' => ['theme' => 'dark']],
            'App\Card::render( $limit )' => ['type' => 'int', 'value' => '3'],
            'App\render_card($limit)' => 'int',
            'App\Abstract' => ['type' => 'App\Concrete'],
        ]]);

        self::assertSame(['app\renderable' => 'App\HtmlBlock', 'app\abstract' => 'App\Concrete'], $bindings['types']);
        self::assertSame(['type' => null, 'value' => ['theme' => 'dark'], 'hasValue' => true], $bindings['slots']['app\card::$meta']);
        self::assertSame(['type' => 'int', 'value' => '3', 'hasValue' => true], $bindings['slots']['app\card::render($limit)']);
        self::assertSame(['type' => 'int', 'value' => null, 'hasValue' => false], $bindings['slots']['app\render_card($limit)']);
    }

    public function testMissingOrInvalidBindingContainersAreEmpty(): void
    {
        self::assertSame(['types' => [], 'slots' => []], \StorybookPhp\Runtime\Contract\normalizeTypeMapBindings(null));
        self::assertSame(['types' => [], 'slots' => []], \StorybookPhp\Runtime\Contract\normalizeTypeMapBindings(['bindings' => 'invalid']));
    }

    /**
     * @dataProvider providerInvalidBindings
     *
     * @param array<array-key, mixed> $bindings
     */
    public function testRejectsInvalidBindings(array $bindings, string $reason): void
    {
        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage($reason);

        \StorybookPhp\Runtime\Contract\normalizeTypeMapBindings(['bindings' => $bindings]);
    }

    /**
     * @return iterable<string, array{array<array-key, mixed>, string}>
     */
    public static function providerInvalidBindings(): iterable
    {
        yield 'numeric key' => [['App\Concrete'], 'typeMap binding keys must be type or slot names, found key 0.'];
        yield 'unsupported key' => [['App\Card::nope' => 'x'], "typeMap binding key 'App\\Card::nope' is not supported."];
        yield 'type binding without type' => [['App\Renderable' => ['value' => 1]], "typeMap binding 'App\\Renderable' maps a type, so it needs a concrete class name"];
        yield 'empty type' => [['App\Renderable' => ' '], "typeMap binding 'App\\Renderable' has an empty type name."];
        yield 'scalar object' => [['App\Renderable' => 5], "typeMap binding 'App\\Renderable' must be a type name string or an object with 'type' and/or 'value', received int."];
        yield 'object without keys' => [['App\Card::$x' => ['other' => 1]], "typeMap binding 'App\\Card::\$x' must be a type name string or an object with 'type' and/or 'value', received array."];
        yield 'non string type' => [['App\Card::$x' => ['type' => 5]], "typeMap binding 'App\\Card::\$x' has a 'type' that is not a type name string."];
    }

    public function testParseBindingKeyCanonicalises(): void
    {
        self::assertSame('app\card::$body', \StorybookPhp\Runtime\Contract\parseBindingKey(' \App\Card::$body '));
        self::assertSame('app\card::render($limit)', \StorybookPhp\Runtime\Contract\parseBindingKey('App\Card::render($limit)'));
        self::assertSame('app\render($limit)', \StorybookPhp\Runtime\Contract\parseBindingKey('App\render($limit)'));
        self::assertNull(\StorybookPhp\Runtime\Contract\parseBindingKey('App\Renderable'));
    }

    public function testBoundTypeNameFollowsChainsAndDetectsCycles(): void
    {
        $bindings = \StorybookPhp\Runtime\Contract\normalizeTypeMapBindings(['bindings' => ['App\A' => 'App\B', 'App\B' => 'App\C', 'App\X' => 'App\Y', 'App\Y' => 'App\X']]);

        self::assertSame('App\C', \StorybookPhp\Runtime\Contract\boundTypeName('\App\A', $bindings));
        self::assertSame('App\Other', \StorybookPhp\Runtime\Contract\boundTypeName('App\Other', $bindings));

        $this->expectException(HydrationException::class);
        $this->expectExceptionMessage("typeMap bindings for 'App\\X' form a cycle: app\\x -> app\\y.");
        \StorybookPhp\Runtime\Contract\boundTypeName('App\X', $bindings);
    }

    public function testSlotBindingReturnsTheFirstMatchingKey(): void
    {
        $bindings = \StorybookPhp\Runtime\Contract\normalizeTypeMapBindings(['bindings' => ['App\Card::$body' => 'App\HtmlBlock']]);

        self::assertSame(
            ['type' => 'App\HtmlBlock', 'value' => null, 'hasValue' => false],
            \StorybookPhp\Runtime\Contract\slotBinding(['app\card::__construct($body)', 'App\Card::$body'], $bindings),
        );
        self::assertNull(\StorybookPhp\Runtime\Contract\slotBinding(['app\card::$other'], $bindings));
    }
}
