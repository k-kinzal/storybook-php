<?php

declare(strict_types=1);

namespace Tests\Property;

use Eris\Generators;
use Eris\TestTrait;
use PHPUnit\Framework\TestCase;

/**
 * @group pbt
 * @medium
 * @covers \StorybookPhp\Runtime\Contract\splitGenericArgs
 * @covers \StorybookPhp\Runtime\Casting\splitUnionTypes
 */
final class DocTypeParserTest extends TestCase
{
    use TestTrait;

    public function testNestedSeparatorsRemainInsideTheirTypeArgument(): void
    {
        $this->limitTo(500)
            ->forAll(
                Generators::elements('int', 'string', 'float', '\\App\\Item'),
                Generators::choose(0, 12),
                Generators::elements('', ' ', "\t"),
            )
            ->then(function (string $leaf, int $depth, string $space): void {
                $nested = str_repeat('array<string, ', $depth) . $leaf . str_repeat('>', $depth);
                $types = [$nested, 'null', 'list<' . $leaf . '|null>'];

                self::assertSame($types, \StorybookPhp\Runtime\Contract\splitGenericArgs(implode($space . ',' . $space, $types)));
                self::assertSame($types, \StorybookPhp\Runtime\Casting\splitUnionTypes(implode($space . '|' . $space, $types)));
            });
    }
}
