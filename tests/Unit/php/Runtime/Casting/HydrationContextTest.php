<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Casting;

use PHPUnit\Framework\TestCase;
use StorybookPhp\Runtime\Casting\HydrationContext;
use StorybookPhp\Runtime\Contract\TypeNode;

/**
 * @covers \StorybookPhp\Runtime\Contract\TypeNode
 * @covers \StorybookPhp\Runtime\Casting\HydrationContext
 * @covers \StorybookPhp\Runtime\Contract\normalizeTypeMappings
 * @covers \StorybookPhp\Runtime\Contract\parseBindingKey
 * @covers \StorybookPhp\Runtime\Contract\normalizeBindingValue
 */
final class HydrationContextTest extends TestCase
{
    public function testFromTypesNormalisesBindings(): void
    {
        $context = HydrationContext::fromTypes(['App\Renderable' => 'App\HtmlBlock']);

        self::assertSame(['app\renderable' => 'App\HtmlBlock'], $context->bindings['types']);
        self::assertSame('', $context->path);
        self::assertSame([], $context->templates);
        self::assertSame(['types' => [], 'slots' => []], HydrationContext::fromTypes(null)->bindings);
    }



    public function testAtAppendsSlotLabels(): void
    {
        $context = HydrationContext::fromTypes(null);

        self::assertSame('App\Card::$title', $context->at('App\Card::$title')->path);
        self::assertSame('App\Card::$items > App\Item::$label', $context->at('App\Card::$items')->at('App\Item::$label')->path);
    }

    public function testKeyAppendsArrayKeys(): void
    {
        $context = HydrationContext::fromTypes(null)->at('App\Card::$meta');

        self::assertSame('App\Card::$meta[theme]', $context->key('theme')->path);
        self::assertSame('App\Card::$meta[0]', $context->key(0)->path);
    }

    public function testWithTemplatesKeepsBindingsAndPath(): void
    {
        $bindings = ['types' => ['a' => 'B'], 'slots' => []];
        $template = new TypeNode('named', 'App\Item');
        $context = (new HydrationContext($bindings, 'App\Card::$items'))->withTemplates(['T' => $template]);

        self::assertSame(['T' => $template], $context->templates);
        self::assertSame($bindings, $context->bindings);
        self::assertSame('App\Card::$items', $context->path);
        self::assertSame(['T' => $template], $context->key(1)->templates);
    }
}
