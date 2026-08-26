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

/**
 * @covers \StorybookPhp\Runtime\Casting\castInlineDocTypeValue
 * @covers \StorybookPhp\Runtime\Casting\castWithNamedType
 * @covers \StorybookPhp\Runtime\Casting\instantiateClassFromValue
 * @covers \StorybookPhp\Runtime\Casting\reflectionTypeAcceptsArray
 * @covers \StorybookPhp\Runtime\Casting\scoreClassInstantiationMatch
 * @covers \StorybookPhp\Runtime\Casting\canInstantiateCollectionWrapper
 * @covers \StorybookPhp\Runtime\Casting\castArg
 * @covers \StorybookPhp\Runtime\Casting\castDeclaredNamedType
 * @covers \StorybookPhp\Runtime\Casting\castInlineNamedType
 * @covers \StorybookPhp\Runtime\Casting\castReflectionBuiltinType
 * @covers \StorybookPhp\Runtime\Casting\isInlineBuiltinType
 * @covers \StorybookPhp\Runtime\Casting\isListArray
 * @covers \StorybookPhp\Runtime\Casting\isReflectionBuiltinType
 * @covers \StorybookPhp\Runtime\Casting\rankDocTypeCandidates
 * @covers \StorybookPhp\Runtime\Casting\resolveBoundTypeName
 * @covers \StorybookPhp\Runtime\Casting\scoreDeclaredTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreDocTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreGenericDocTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreInlineNamedTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreNativeTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\splitUnionTypes
 * @covers \StorybookPhp\Runtime\Contract\enumTypeExists
 * @covers \StorybookPhp\Runtime\Contract\extractGenericValueType
 * @covers \StorybookPhp\Runtime\Contract\parseDocBlockParamTypes
 * @covers \StorybookPhp\Runtime\Contract\requireExistingClass
 * @covers \StorybookPhp\Runtime\Contract\resolveClassName
 * @covers \StorybookPhp\Runtime\Contract\resolveTypeMapBinding
 * @covers \StorybookPhp\Runtime\Contract\splitGenericArgs
 * @covers \StorybookPhp\Runtime\Contract\typeExists
 * @covers \StorybookPhp\Runtime\Execution\matchArgs
 * @covers \StorybookPhp\Runtime\Execution\resolveArgs
 * @covers \StorybookPhp\Runtime\Execution\resolveParamDocType
 * @covers \StorybookPhp\Runtime\Execution\resolveParameterArgDef
 * @covers \StorybookPhp\Runtime\Execution\resolveParameterArgValue
 * @covers \StorybookPhp\Runtime\Transport\stringifyOutputValue
 */
final class runtime_castTest extends TestCase
{
    public function testConstructorScoringRejectsMissingRequiredArguments(): void
    {
        self::assertSame(0, \StorybookPhp\Runtime\Casting\scoreClassInstantiationMatch(AbstractCollection::class, []));
        self::assertSame(1, \StorybookPhp\Runtime\Casting\scoreClassInstantiationMatch(NoConstructorItem::class, []));
        self::assertSame(0, \StorybookPhp\Runtime\Casting\scoreClassInstantiationMatch(BrokenCollection::class, ['label' => 'item']));
        self::assertSame(1, \StorybookPhp\Runtime\Casting\scoreClassInstantiationMatch(Item::class, ['label' => 'item']));
        self::assertSame(0, \StorybookPhp\Runtime\Casting\scoreClassInstantiationMatch(Item::class, []));
        self::assertSame(1, \StorybookPhp\Runtime\Casting\scoreClassInstantiationMatch(Item::class, ['item']));
        self::assertSame(0, \StorybookPhp\Runtime\Casting\scoreClassInstantiationMatch(Item::class, ['item', 'extra']));
        self::assertSame(1, \StorybookPhp\Runtime\Casting\scoreClassInstantiationMatch(VariadicConstructorFixture::class, ['one', 'two']));
    }

    public function testUnionSelectionUsesTheCompatibleConstructorContract(): void
    {
        $result = \StorybookPhp\Runtime\Casting\castInlineDocTypeValue(
            ['label' => 'item'],
            BrokenCollection::class . '<' . Item::class . '>|' . Item::class,
        );

        self::assertInstanceOf(Item::class, $result);
    }

    public function testUnionConversionDoesNotHideProgrammingErrors(): void
    {
        $this->expectException(TypeError::class);
        \StorybookPhp\Runtime\Casting\castInlineDocTypeValue(
            ['label' => 'item'],
            FailingConstructor::class . '|' . Item::class,
        );
    }

    public function testScalarInstantiationUsesTheSingleParameterContract(): void
    {
        $item = \StorybookPhp\Runtime\Casting\instantiateClassFromValue(Item::class, 'label');

        self::assertSame('label', $item->label);
    }

    public function testArrayAcceptanceCoversUntypedAndUnionParameters(): void
    {
        self::assertTrue(\StorybookPhp\Runtime\Casting\reflectionTypeAcceptsArray(null));

        $accepting = new ReflectionParameter(
            static function (array|string $value): void {
            },
            0,
        );
        self::assertTrue(\StorybookPhp\Runtime\Casting\reflectionTypeAcceptsArray($accepting->getType()));

        $rejecting = new ReflectionParameter(
            static function (int|string $value): void {
            },
            0,
        );
        self::assertFalse(\StorybookPhp\Runtime\Casting\reflectionTypeAcceptsArray($rejecting->getType()));
    }

    public function testVoidTypeCannotAcceptAnArgumentValue(): void
    {
        $parameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsUntyped', 0);
        $voidType = (new ReflectionFunction(static function (): void {
        }))->getReturnType();
        self::assertInstanceOf(ReflectionNamedType::class, $voidType);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage("Cannot provide a value for 'void' type parameter");
        \StorybookPhp\Runtime\Casting\castWithNamedType($voidType, 'raw', $parameter);
    }

    public function testNeverTypeCannotAcceptAnArgumentValue(): void
    {
        if (PHP_VERSION_ID < 80100) {
            self::assertTrue(\StorybookPhp\Runtime\Casting\isReflectionBuiltinType('never'));

            return;
        }

        $parameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsUntyped', 0);
        $neverClosure = eval('return function (): never { throw new RuntimeException("never"); };');
        $neverType = (new ReflectionFunction($neverClosure))->getReturnType();
        self::assertInstanceOf(ReflectionNamedType::class, $neverType);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage("Cannot provide a value for 'never' type parameter");
        \StorybookPhp\Runtime\Casting\castWithNamedType($neverType, 'raw', $parameter);
    }

    public function testUnknownDeclaredClassFailsBeforeInvocation(): void
    {
        $closure = eval('return static function (\\StorybookPhp\\MissingRuntimeType $value): void {};');
        $parameter = new ReflectionParameter($closure, 0);
        $type = $parameter->getType();
        self::assertInstanceOf(ReflectionNamedType::class, $type);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage("Class 'StorybookPhp\\MissingRuntimeType' is not available.");
        \StorybookPhp\Runtime\Casting\castWithNamedType($type, [], $parameter);
    }
}
