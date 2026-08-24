<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;
use StorybookPhp\TestFixture\AbstractCollection;
use StorybookPhp\TestFixture\BrokenCollection;
use StorybookPhp\TestFixture\Item;
use StorybookPhp\TestFixture\NoConstructorItem;

require_once __DIR__ . '/fixtures/RunnerFixtures.php';

final class FailingConstructor
{
    public function __construct(public string $label)
    {
        throw new TypeError('broken constructor');
    }
}

final class VariadicConstructorFixture
{
    public function __construct(string ...$values)
    {
        if ($values === []) {
            throw new RuntimeException('At least one value is required.');
        }
    }
}

final class RuntimeCastTest extends TestCase
{
    public function testConstructorScoringRejectsMissingRequiredArguments(): void
    {
        self::assertSame(0, scoreClassInstantiationMatch(AbstractCollection::class, []));
        self::assertSame(1, scoreClassInstantiationMatch(NoConstructorItem::class, []));
        self::assertSame(0, scoreClassInstantiationMatch(BrokenCollection::class, ['label' => 'item']));
        self::assertSame(1, scoreClassInstantiationMatch(Item::class, ['label' => 'item']));
        self::assertSame(0, scoreClassInstantiationMatch(Item::class, []));
        self::assertSame(1, scoreClassInstantiationMatch(Item::class, ['item']));
        self::assertSame(0, scoreClassInstantiationMatch(Item::class, ['item', 'extra']));
        self::assertSame(1, scoreClassInstantiationMatch(VariadicConstructorFixture::class, ['one', 'two']));
    }

    public function testUnionSelectionUsesTheCompatibleConstructorContract(): void
    {
        $result = castInlineDocTypeValue(
            ['label' => 'item'],
            BrokenCollection::class . '<' . Item::class . '>|' . Item::class,
        );

        self::assertInstanceOf(Item::class, $result);
    }

    public function testUnionConversionDoesNotHideProgrammingErrors(): void
    {
        $this->expectException(TypeError::class);
        castInlineDocTypeValue(
            ['label' => 'item'],
            FailingConstructor::class . '|' . Item::class,
        );
    }

    public function testScalarInstantiationUsesTheSingleParameterContract(): void
    {
        $item = instantiateClassFromValue(Item::class, 'label');

        self::assertSame('label', $item->label);
    }

    public function testArrayAcceptanceCoversUntypedAndUnionParameters(): void
    {
        self::assertTrue(reflectionTypeAcceptsArray(null));

        $accepting = new ReflectionParameter(
            static function (array|string $value): void {
            },
            0,
        );
        self::assertTrue(reflectionTypeAcceptsArray($accepting->getType()));

        $rejecting = new ReflectionParameter(
            static function (int|string $value): void {
            },
            0,
        );
        self::assertFalse(reflectionTypeAcceptsArray($rejecting->getType()));
    }

    public function testNeverAndUnknownNamedTypesKeepExplicitFailureSemantics(): void
    {
        $parameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsUntyped', 0);
        $voidType = (new ReflectionFunction(static function (): void {
        }))->getReturnType();
        self::assertInstanceOf(ReflectionNamedType::class, $voidType);
        self::assertSame('raw', castWithNamedType($voidType, 'raw', $parameter));

        if (PHP_VERSION_ID < 80100) {
            return;
        }

        $neverClosure = eval('return function (): never { throw new RuntimeException("never"); };');
        $neverType = (new ReflectionFunction($neverClosure))->getReturnType();
        self::assertInstanceOf(ReflectionNamedType::class, $neverType);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage("Cannot provide a value for 'never' type parameter");
        castWithNamedType($neverType, 'raw', $parameter);
    }
}
