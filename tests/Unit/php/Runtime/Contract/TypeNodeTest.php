<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Contract;

use PHPUnit\Framework\TestCase;
use StorybookPhp\Runtime\Contract\TypeNode;

/**
 * @covers \StorybookPhp\Runtime\Contract\TypeNode
 */
final class TypeNodeTest extends TestCase
{
    public function testDefaultsDescribeAPlainNamedType(): void
    {
        $node = new TypeNode('named', 'App\Item');

        self::assertSame('named', $node->kind);
        self::assertSame('App\Item', $node->name);
        self::assertSame([], $node->members);
        self::assertSame([], $node->fields);
        self::assertSame([], $node->optionalKeys);
        self::assertTrue($node->sealed);
        self::assertNull($node->literal);
    }

    public function testShapeNodesKeepFieldsOptionalKeysAndSealing(): void
    {
        $field = new TypeNode('named', 'int');
        $node = new TypeNode('shape', 'array', [], ['count' => $field], ['count'], false);

        self::assertSame(['count' => $field], $node->fields);
        self::assertSame(['count'], $node->optionalKeys);
        self::assertFalse($node->sealed);
    }

    public function testLiteralNodesCarryTheirValue(): void
    {
        self::assertSame('draft', (new TypeNode('literal', '', [], [], [], true, 'draft'))->literal);
        self::assertTrue((new TypeNode('literal', '', [], [], [], true, true))->literal);
    }
}
