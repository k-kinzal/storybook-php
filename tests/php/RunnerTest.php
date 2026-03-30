<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;
use StorybookPhp\EnumFixture\Status;
use StorybookPhp\EnumFixture\UnitStatus;
use StorybookPhp\TestFixture\ExampleRenderer;
use StorybookPhp\TestFixture\Formatter;
use StorybookPhp\TestFixture\FormatterInterface;
use StorybookPhp\TestFixture\AbstractCollection;
use StorybookPhp\TestFixture\BrokenCollection;
use StorybookPhp\TestFixture\Item;
use StorybookPhp\TestFixture\ListCollection;
use StorybookPhp\TestFixture\ListCollectionContract;
use StorybookPhp\TestFixture\NoConstructorItem;
use StorybookPhp\TestFixture\NoConstructorCollection;
use StorybookPhp\TestFixture\NoConstructorRenderer;
use StorybookPhp\TestFixture\OverrideTarget;
use StorybookPhp\TestFixture\SelfReferencing;
use StorybookPhp\TestFixture\StringableValue;

final class RunnerTest extends TestCase
{
    private const FIXTURE_FILE = __DIR__ . '/fixtures/RunnerFixtures.php';
    private const ENUM_FILE = __DIR__ . '/fixtures/EnumFixtures.php';
    private const TEMPLATE_FILE = __DIR__ . '/fixtures/Template.php';
    private const BOOTSTRAP_FILE = __DIR__ . '/fixtures/Bootstrap.php';
    private const ADAPTER_FILE = __DIR__ . '/fixtures/Adapter.php';
    private const INVALID_ADAPTER_FILE = __DIR__ . '/fixtures/InvalidAdapter.php';
    private const NON_STRING_ADAPTER_FILE = __DIR__ . '/fixtures/NonStringAdapter.php';

    public static function setUpBeforeClass(): void
    {
        require_once self::FIXTURE_FILE;

        if (PHP_VERSION_ID >= 80100) {
            require_once self::ENUM_FILE;
        }
    }

    public function testParseDocBlockParamTypesHonorsAnnotationPriority(): void
    {
        self::assertSame([], parseDocBlockParamTypes(null));
        self::assertSame([], parseDocBlockParamTypes(new ReflectionFunction('StorybookPhp\\TestFixture\\noDocBlock')));
        self::assertSame(
            ['values' => 'list<float>'],
            parseDocBlockParamTypes(new ReflectionFunction('StorybookPhp\\TestFixture\\docPriority')),
        );
        self::assertSame(
            ['values' => 'list<int>'],
            parseDocBlockParamTypes(new ReflectionFunction('StorybookPhp\\TestFixture\\psalmPriority')),
        );
        self::assertSame(
            ['values' => 'list<string>'],
            parseDocBlockParamTypes(new ReflectionFunction('StorybookPhp\\TestFixture\\paramOnly')),
        );
    }

    public function testGenericHelpersResolveArrayAndWrapperTypes(): void
    {
        self::assertSame(['string', 'list<Foo>'], splitGenericArgs('string, list<Foo>'));
        self::assertSame(
            ['valueType' => Item::class, 'wrapperClass' => null],
            extractGenericValueType(Item::class . '[]'),
        );
        self::assertSame(
            ['valueType' => Item::class, 'wrapperClass' => null],
            extractGenericValueType('array<string, ' . Item::class . '>|null'),
        );
        self::assertSame(
            ['valueType' => Item::class, 'wrapperClass' => ListCollection::class],
            extractGenericValueType(ListCollection::class . '<' . Item::class . '>|null'),
        );
        self::assertNull(extractGenericValueType('string'));
        self::assertTrue(isArrayLikeType(Item::class . '[]'));
        self::assertTrue(isArrayLikeType('list<' . Item::class . '>'));
        self::assertFalse(isArrayLikeType(Item::class));
        self::assertTrue(isRenderType('function'));
        self::assertFalse(isRenderType('unknown'));
        self::assertSame(['Foo<Bar|Baz>', '(A&B)', 'string'], splitUnionTypes('Foo<Bar|Baz>|(A&B)|string'));
        self::assertTrue(typeExists(Item::class));
        self::assertTrue(typeExists(FormatterInterface::class));
        self::assertFalse(typeExists('StorybookPhp\\MissingType'));
        self::assertSame('Foo', resolveTypeMapBinding('Foo', null));
        self::assertSame('Foo', resolveTypeMapBinding('Foo', ['bindings' => 'invalid']));
        self::assertSame('Bar', resolveTypeMapBinding('Foo', ['bindings' => ['Foo' => 'Bar']]));
        self::assertSame('Foo', resolveTypeMapBinding('Foo', ['bindings' => ['Foo' => ['bad']]]));
    }

    public function testEnumHelpersResolveBackedAndNamedCases(): void
    {
        if (PHP_VERSION_ID < 80100) {
            self::markTestSkipped('Enums require PHP 8.1+.');
        }

        self::assertTrue(isBackedEnumClass(Status::class));
        self::assertFalse(isBackedEnumClass(UnitStatus::class));
        self::assertSame(Status::Draft, resolveEnumCase(Status::class, Status::Draft));
        self::assertSame(Status::Published, resolveEnumCase(Status::class, 'published'));
        self::assertSame(UnitStatus::Pending, resolveEnumCase(UnitStatus::class, 'Pending'));

        try {
            resolveEnumCase(Status::class, 'missing');
            self::fail('Expected invalid backed enum value to fail.');
        } catch (RuntimeException $e) {
            self::assertStringContainsString('Cannot resolve enum case', $e->getMessage());
        }

        $this->expectException(RuntimeException::class);
        resolveEnumCase(Item::class, 'missing');
    }

    public function testResolveClassNameUsesDeclaringNamespace(): void
    {
        $parameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsItems', 0);

        self::assertSame(Item::class, resolveClassName('Item', $parameter));
        self::assertSame(Item::class, resolveClassName('\\' . Item::class, $parameter));
        self::assertNull(resolveClassName('MissingType', $parameter));
    }

    public function testCastArrayElementsSupportsClassesEnumsAndFallbacks(): void
    {
        $itemsParameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsItems', 0);
        $castItems = castArrayElements([['label' => 'alpha'], new Item('beta')], 'list<Item>', $itemsParameter);

        self::assertInstanceOf(Item::class, $castItems[0]);
        self::assertSame('alpha', $castItems[0]->label);
        self::assertSame('beta', $castItems[1]->label);
        self::assertSame([['label' => 'keep']], castArrayElements([['label' => 'keep']], 'string', $itemsParameter));
        self::assertSame(
            [['label' => 'keep']],
            castArrayElements([['label' => 'keep']], 'list<Item|StringableValue>', $itemsParameter),
        );

        $nestedParameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsNestedItems', 0);
        $nested = castArrayElements([[['label' => 'nested']]], 'list<list<Item>>', $nestedParameter);
        self::assertInstanceOf(Item::class, $nested[0][0]);
        self::assertSame('nested', $nested[0][0]->label);

        $noConstructorParameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsNoConstructorItems', 0);
        $noConstructorItems = castArrayElements([[]], 'list<NoConstructorItem>', $noConstructorParameter);
        self::assertInstanceOf(NoConstructorItem::class, $noConstructorItems[0]);
        self::assertSame('generated', $noConstructorItems[0]->label);
        self::assertSame(
            [['label' => 'keep']],
            castArrayElements([['label' => 'keep']], 'list<MissingType>', $itemsParameter),
        );

        if (PHP_VERSION_ID >= 80100) {
            $enumParameter = new ReflectionParameter('StorybookPhp\\EnumFixture\\acceptsStatuses', 0);
            $enumValues = castArrayElements(['draft', 'missing'], 'list<Status>', $enumParameter);
            self::assertSame(Status::Draft, $enumValues[0]);
            self::assertSame('missing', $enumValues[1]);
        }
    }

    public function testInlineAndTemplateCastingHelpersCoverRuntimeTypeMapPaths(): void
    {
        self::assertSame('123', castInlineNamedType('string', 123));
        self::assertSame(12, castInlineNamedType('int', 12));
        self::assertSame(12, castInlineNamedType('int', '12'));
        self::assertSame(2.5, castInlineNamedType('float', '2.5'));
        self::assertSame(2.5, castInlineNamedType('float', 2.5));
        self::assertTrue(castInlineNamedType('bool', 'yes'));
        self::assertTrue(castInlineNamedType('bool', true));
        self::assertSame(['key' => 'value'], castInlineNamedType('array', ['key' => 'value']));
        $inlineObject = new stdClass();
        self::assertSame($inlineObject, castInlineNamedType('object', $inlineObject));
        self::assertInstanceOf(stdClass::class, castInlineNamedType('object', ['key' => 'value']));
        $resource = fopen('php://temp', 'rb');
        self::assertIsResource($resource);
        $resourceObject = castInlineNamedType('object', $resource);
        fclose($resource);
        self::assertSame([], get_object_vars($resourceObject));
        $callable = static fn (): string => 'ok';
        self::assertSame($callable, castInlineNamedType('callable', $callable));
        self::assertSame(['mixed' => true], castInlineNamedType('mixed', ['mixed' => true]));
        self::assertSame(['unknown' => true], castInlineNamedType('unknown', ['unknown' => true]));
        self::assertTrue(castInlineNamedType('true', false));
        self::assertFalse(castInlineNamedType('false', true));
        self::assertNull(castInlineNamedType('null', 'value'));
        self::assertSame('raw', castInlineNamedType('MissingType', 'raw'));

        $boundFormatter = castInlineNamedType(
            FormatterInterface::class,
            ['prefix' => 'hi-'],
            ['bindings' => [FormatterInterface::class => Formatter::class]],
        );
        self::assertInstanceOf(Formatter::class, $boundFormatter);
        self::assertSame('hi-VALUE', $boundFormatter->format('value'));
        self::assertSame($boundFormatter, castInlineNamedType(Formatter::class, $boundFormatter));

        $noConstructor = castInlineNamedType(NoConstructorItem::class, []);
        self::assertInstanceOf(NoConstructorItem::class, $noConstructor);
        $positionalCollection = castInlineNamedType(BrokenCollection::class, [[new Item('alpha')], 'named']);
        self::assertInstanceOf(BrokenCollection::class, $positionalCollection);
        self::assertSame('alpha', $positionalCollection->items[0]->label);
        self::assertSame('named', $positionalCollection->name);
        try {
            castInlineNamedType(ExampleRenderer::class, '5');
            self::fail('Expected scalar fallback into multi-parameter constructors to require named args.');
        } catch (RuntimeException $e) {
            self::assertSame('Missing required argument: id', $e->getMessage());
        }

        if (PHP_VERSION_ID >= 80100) {
            self::assertSame(Status::Published, castInlineNamedType(Status::class, 'published'));
        }

        self::assertNull(castInlineDocTypeValue(null, 'string'));
        self::assertSame('value', castInlineDocTypeValue('value', 'mixed'));
        self::assertSame(5, castInlineDocTypeValue('5', '?int'));
        self::assertSame(5, castInlineDocTypeValue('5', 'null|int'));
        self::assertSame('draft', castInlineDocTypeValue('draft', 'int|string'));

        if (PHP_VERSION_ID >= 80100) {
            self::assertSame(Status::Draft, castInlineDocTypeValue('draft', 'int|' . Status::class));
            self::assertSame(Status::Draft, castInlineDocTypeValue('draft', Status::class . '|int'));
            self::assertSame(5, castInlineDocTypeValue('5', Status::class . '|int'));
            self::assertSame(
                'missing',
                castInlineDocTypeValue('missing', Status::class . '|' . UnitStatus::class),
            );
        }

        $castInlineList = castInlineDocTypeValue([['label' => 'alpha']], 'list<' . Item::class . '>');
        self::assertInstanceOf(Item::class, $castInlineList[0]);

        $wrappedInlineList = castInlineDocTypeValue([['label' => 'wrapped']], ListCollection::class . '<' . Item::class . '>');
        self::assertInstanceOf(ListCollection::class, $wrappedInlineList);
        self::assertInstanceOf(Item::class, $wrappedInlineList->items[0]);

        $noConstructorWrapped = castInlineDocTypeValue([['label' => 'ignored']], NoConstructorCollection::class . '<' . Item::class . '>');
        self::assertInstanceOf(NoConstructorCollection::class, $noConstructorWrapped);
        self::assertSame([], $noConstructorWrapped->items);
        $missingWrapped = castInlineDocTypeValue([['label' => 'raw']], 'MissingWrapper<' . Item::class . '>');
        self::assertInstanceOf(Item::class, $missingWrapped[0]);

        $templateWrapper = castTemplateArgValue(
            ['type' => ListCollection::class, 'elementType' => Item::class],
            [['label' => 'first']],
        );
        self::assertInstanceOf(ListCollection::class, $templateWrapper);
        self::assertInstanceOf(Item::class, $templateWrapper->items[0]);

        $templateList = castTemplateArgValue(
            ['type' => 'array', 'elementType' => Item::class],
            [['label' => 'second']],
        );
        self::assertInstanceOf(Item::class, $templateList[0]);
        $templateNoConstructorWrapper = castTemplateArgValue(
            ['type' => NoConstructorCollection::class, 'elementType' => Item::class],
            [['label' => 'third']],
        );
        self::assertInstanceOf(NoConstructorCollection::class, $templateNoConstructorWrapper);
        self::assertSame('keep', castTemplateArgValue(['type' => 'unknown'], 'keep'));
        self::assertSame(8, castTemplateArgValue(['type' => 'int'], '8'));
        self::assertNull(castTemplateArgValue(['type' => 'string'], null));

        $templateArgs = castTemplateArgs(
            ['title' => 'Hello'],
            [
                'skip' => 'ignore-me',
                'title' => ['type' => 'string', 'required' => true],
                'count' => ['type' => 'int', 'required' => false, 'default' => '3'],
                'note' => ['type' => 'string', 'required' => false, 'nullable' => true],
            ],
        );
        self::assertSame('Hello', $templateArgs['title']);
        self::assertSame(3, $templateArgs['count']);
        self::assertNull($templateArgs['note']);

        try {
            castTemplateArgs([], ['title' => ['type' => 'string', 'required' => true]]);
            self::fail('Expected required template arg failure.');
        } catch (RuntimeException $e) {
            self::assertSame('Missing required argument: title', $e->getMessage());
        }
    }

    public function testScoringHelpersCoverBindingAndFallbackBranches(): void
    {
        $formatterParameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsFormatter', 0);
        self::assertSame(
            Formatter::class,
            resolveBoundTypeName(
                'FormatterInterface',
                ['bindings' => ['FormatterInterface' => Formatter::class]],
                $formatterParameter,
            ),
        );

        self::assertSame(2, scoreInlineNamedTypeMatch('string', new StringableValue('score')));
        self::assertSame(1, scoreInlineNamedTypeMatch('float', '2.5'));
        self::assertSame(1, scoreInlineNamedTypeMatch('bool', 1));
        self::assertSame(1, scoreInlineNamedTypeMatch('bool', 'yes'));
        self::assertSame(0, scoreInlineNamedTypeMatch('bool', new stdClass()));
        self::assertSame(1, scoreInlineNamedTypeMatch('iterable', new ArrayIterator([])));
        self::assertSame(3, scoreInlineNamedTypeMatch('object', new stdClass()));
        self::assertSame(1, scoreInlineNamedTypeMatch('object', ['wrapped' => true]));
        self::assertSame(3, scoreInlineNamedTypeMatch('callable', static fn (): string => 'ok'));
        self::assertSame(3, scoreInlineNamedTypeMatch('null', null));
        self::assertSame(3, scoreInlineNamedTypeMatch(FormatterInterface::class, new Formatter()));
        self::assertSame(0, scoreInlineNamedTypeMatch('StorybookPhp\\MissingClass', ['value' => true]));
        self::assertSame(1, scoreInlineNamedTypeMatch(Item::class, ['label' => 'array']));

        if (PHP_VERSION_ID >= 80100) {
            self::assertSame(3, scoreInlineNamedTypeMatch(Status::class, Status::Draft));
        }

        $untypedParameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsUntyped', 0);
        self::assertSame(0, scoreDocTypeMatch('unknown', 'value', $untypedParameter));
        self::assertSame(3, scoreDocTypeMatch('?int', null, $untypedParameter));
        self::assertSame(2, scoreDocTypeMatch('?int', '4', $untypedParameter));
        self::assertSame(3, scoreDocTypeMatch('int|string', '4', $untypedParameter));
        self::assertSame(3, scoreDocTypeMatch('null|string', 'value', $untypedParameter));
        self::assertSame(4, scoreDocTypeMatch('list<Item>', [['label' => 'alpha']], $untypedParameter));
        self::assertSame(5, scoreDocTypeMatch(ListCollection::class . '<Item>', new ListCollection([]), $untypedParameter));
        self::assertSame(0, scoreDocTypeMatch(ListCollection::class . '<Item>', 'invalid', $untypedParameter));
    }

    public function testUnionAndWrapperCastingFallbacksCoverFailureBranches(): void
    {
        self::assertSame(5, castInlineDocTypeValue('5', 'float|int'));

        $inlineTiedUnion = castInlineDocTypeValue(['label' => 'inline'], Item::class . '|' . NoConstructorItem::class);
        self::assertInstanceOf(Item::class, $inlineTiedUnion);

        $inlineFallbackUnion = castInlineDocTypeValue(
            ['label' => 'inline'],
            BrokenCollection::class . '<' . Item::class . '>|' . Item::class,
        );
        self::assertInstanceOf(Item::class, $inlineFallbackUnion);

        $inlineAbstractWrapper = castInlineDocTypeValue(
            [['label' => 'inline-abstract']],
            AbstractCollection::class . '<' . Item::class . '>',
        );
        self::assertIsArray($inlineAbstractWrapper);
        self::assertInstanceOf(Item::class, $inlineAbstractWrapper[0]);

        $untypedParameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsUntyped', 0);
        self::assertSame(5, castDocTypeValue('5', 'float|int', $untypedParameter));

        $docTiedUnion = castDocTypeValue(
            ['label' => 'doc'],
            Item::class . '|' . NoConstructorItem::class,
            $untypedParameter,
        );
        self::assertInstanceOf(Item::class, $docTiedUnion);

        $docFallbackUnion = castDocTypeValue(
            ['label' => 'doc'],
            BrokenCollection::class . '<Item>|' . Item::class,
            $untypedParameter,
        );
        self::assertInstanceOf(Item::class, $docFallbackUnion);

        $docAbstractWrapper = castDocTypeValue(
            [['label' => 'doc-abstract']],
            AbstractCollection::class . '<Item>',
            $untypedParameter,
        );
        self::assertIsArray($docAbstractWrapper);
        self::assertInstanceOf(Item::class, $docAbstractWrapper[0]);

        $templateAbstractWrapper = castTemplateArgValue(
            ['type' => AbstractCollection::class, 'elementType' => Item::class],
            [['label' => 'template']],
        );
        self::assertIsArray($templateAbstractWrapper);
        self::assertInstanceOf(Item::class, $templateAbstractWrapper[0]);

        $unionParameter = (new ReflectionFunction(
            static function (BrokenCollection|Item $value): BrokenCollection|Item {
                return $value;
            },
        ))->getParameters()[0];
        $castUnion = castArg($unionParameter, ['label' => 'named-union']);
        self::assertInstanceOf(Item::class, $castUnion);
    }

    public function testScoreTypeMatchAndCastArgHandlePrimitiveAndSpecialCases(): void
    {
        $intType = $this->namedTypeFromClosure(static function (int $value): int {
            return $value;
        });
        $floatType = $this->namedTypeFromClosure(static function (float $value): float {
            return $value;
        });
        $stringType = $this->namedTypeFromClosure(static function (string $value): string {
            return $value;
        });
        $boolType = $this->namedTypeFromClosure(static function (bool $value): bool {
            return $value;
        });
        $arrayType = $this->namedTypeFromClosure(static function (array $value): array {
            return $value;
        });
        $mixedType = $this->namedTypeFromClosure(static function (mixed $value): mixed {
            return $value;
        });
        $classType = (new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsItem', 0))->getType();

        self::assertInstanceOf(ReflectionNamedType::class, $classType);
        self::assertSame(3, scoreTypeMatch($intType, 1));
        self::assertSame(2, scoreTypeMatch($intType, '1'));
        self::assertSame(3, scoreTypeMatch($floatType, 1.5));
        self::assertSame(1, scoreTypeMatch($stringType, 10));
        self::assertSame(3, scoreTypeMatch($boolType, false));
        self::assertSame(3, scoreTypeMatch($arrayType, ['a']));
        self::assertSame(0, scoreTypeMatch($mixedType, new stdClass()));
        self::assertSame(3, scoreTypeMatch($classType, new Item('x')));

        $nullableParameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsNullable', 0);
        self::assertNull(castArg($nullableParameter, null));

        $untypedParameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsUntyped', 0);
        self::assertSame(['value' => true], castArg($untypedParameter, ['value' => true]));
        self::assertSame(7, castArg($untypedParameter, '7', 'int'));

        $unionParameter = (new ReflectionFunction(static function (int|float $value): int|float {
            return $value;
        }))->getParameters()[0];
        self::assertSame(5, castArg($unionParameter, 5));
        $stringUnionParameter = (new ReflectionFunction(static function (int|string $value): int|string {
            return $value;
        }))->getParameters()[0];
        self::assertSame('draft', castArg($stringUnionParameter, 'draft'));

        if (PHP_VERSION_ID >= 80100) {
            $enumUnion = eval('return function (int|\StorybookPhp\EnumFixture\Status $value): mixed { return $value; };');
            $enumUnionParameter = (new ReflectionFunction($enumUnion))->getParameters()[0];
            self::assertSame(Status::Draft, castArg($enumUnionParameter, 'draft'));

            $intersection = eval('return function (\Countable&\IteratorAggregate $value): \Countable&\IteratorAggregate { return $value; };');
            $intersectionParameter = (new ReflectionFunction($intersection))->getParameters()[0];
            $arrayObject = new ArrayObject([1]);
            self::assertSame($arrayObject, castArg($intersectionParameter, $arrayObject));

            $dnf = eval('return function (\StorybookPhp\EnumFixture\Status|(\Countable&\IteratorAggregate) $value): mixed { return $value; };');
            $dnfParameter = (new ReflectionFunction($dnf))->getParameters()[0];
            self::assertSame($arrayObject, castArg($dnfParameter, $arrayObject));

            $failingUnion = eval('return function (\StorybookPhp\EnumFixture\Status|\StorybookPhp\EnumFixture\UnitStatus $value): mixed { return $value; };');
            $failingUnionParameter = (new ReflectionFunction($failingUnion))->getParameters()[0];
            self::assertSame($arrayObject, castArg($failingUnionParameter, $arrayObject));
        }

        if (PHP_VERSION_ID >= 80200) {
            $trueType = $this->namedTypeFromClosure(eval('return function (true $value): true { return $value; };'));
            $falseType = $this->namedTypeFromClosure(eval('return function (false $value): false { return $value; };'));
            $nullType = $this->namedTypeFromClosure(eval('return function (null $value): null { return $value; };'));

            self::assertSame(3, scoreTypeMatch($trueType, true));
            self::assertSame(3, scoreTypeMatch($falseType, false));
            self::assertSame(2, scoreTypeMatch($nullType, null));
        }
    }

    public function testCastDocTypeValueSupportsGenericWrapperBindingAndFallbackCases(): void
    {
        $untypedParameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsUntyped', 0);

        self::assertSame('value', castDocTypeValue('value', 'unknown', $untypedParameter));
        self::assertNull(castDocTypeValue(null, 'string', $untypedParameter));
        self::assertSame(4, castDocTypeValue('4', '?int', $untypedParameter));
        self::assertSame(4, castDocTypeValue('4', 'null|int', $untypedParameter));
        self::assertSame('draft', castDocTypeValue('draft', 'int|string', $untypedParameter));

        if (PHP_VERSION_ID >= 80100) {
            self::assertSame(Status::Draft, castDocTypeValue('draft', 'int|' . Status::class, $untypedParameter));
            self::assertSame(Status::Draft, castDocTypeValue('draft', Status::class . '|int', $untypedParameter));
            self::assertSame(4, castDocTypeValue('4', Status::class . '|int', $untypedParameter));
            self::assertSame(
                'missing',
                castDocTypeValue('missing', Status::class . '|' . UnitStatus::class, $untypedParameter),
            );
        }

        $arrayItems = castDocTypeValue([['label' => 'doc']], 'list<Item>', $untypedParameter);
        self::assertInstanceOf(Item::class, $arrayItems[0]);

        $wrappedItems = castDocTypeValue([['label' => 'wrapped']], ListCollection::class . '<Item>', $untypedParameter);
        self::assertInstanceOf(ListCollection::class, $wrappedItems);
        self::assertInstanceOf(Item::class, $wrappedItems->items[0]);
        $boundWrappedItems = castDocTypeValue(
            [['label' => 'bound']],
            ListCollectionContract::class . '<Item>',
            $untypedParameter,
            ['bindings' => [ListCollectionContract::class => ListCollection::class]],
        );
        self::assertInstanceOf(ListCollection::class, $boundWrappedItems);
        self::assertInstanceOf(Item::class, $boundWrappedItems->items[0]);

        $noConstructorWrapped = castDocTypeValue([['label' => 'wrapped']], NoConstructorCollection::class . '<Item>', $untypedParameter);
        self::assertInstanceOf(NoConstructorCollection::class, $noConstructorWrapped);
        $missingWrapped = castDocTypeValue([['label' => 'wrapped']], 'MissingWrapper<Item>', $untypedParameter);
        self::assertInstanceOf(Item::class, $missingWrapped[0]);

        $boundFormatter = castDocTypeValue(
            ['prefix' => 'doc-'],
            FormatterInterface::class,
            $untypedParameter,
            ['bindings' => [FormatterInterface::class => Formatter::class]],
        );
        self::assertInstanceOf(Formatter::class, $boundFormatter);
        self::assertSame('doc-VALUE', $boundFormatter->format('value'));
    }

    public function testCastWithNamedTypeHandlesSupportedOutputs(): void
    {
        $stringParameter = (new ReflectionFunction(static function (string $value): string {
            return $value;
        }))->getParameters()[0];
        $stringType = $stringParameter->getType();
        self::assertInstanceOf(ReflectionNamedType::class, $stringType);
        self::assertSame('123', castWithNamedType($stringType, 123, $stringParameter));

        $intParameter = (new ReflectionFunction(static function (int $value): int {
            return $value;
        }))->getParameters()[0];
        $intType = $intParameter->getType();
        self::assertInstanceOf(ReflectionNamedType::class, $intType);
        self::assertSame(5, castWithNamedType($intType, '5', $intParameter));

        $floatParameter = (new ReflectionFunction(static function (float $value): float {
            return $value;
        }))->getParameters()[0];
        $floatType = $floatParameter->getType();
        self::assertInstanceOf(ReflectionNamedType::class, $floatType);
        self::assertSame(5.5, castWithNamedType($floatType, 5.5, $floatParameter));
        self::assertSame(5.5, castWithNamedType($floatType, '5.5', $floatParameter));

        $boolParameter = (new ReflectionFunction(static function (bool $value): bool {
            return $value;
        }))->getParameters()[0];
        $boolType = $boolParameter->getType();
        self::assertInstanceOf(ReflectionNamedType::class, $boolType);
        self::assertTrue(castWithNamedType($boolType, true, $boolParameter));
        self::assertFalse(castWithNamedType($boolType, '0', $boolParameter));
        self::assertTrue(castWithNamedType($boolType, 'yes', $boolParameter));

        $itemsParameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsItems', 0);
        $itemsType = $itemsParameter->getType();
        self::assertInstanceOf(ReflectionNamedType::class, $itemsType);
        self::assertSame([['label' => 'raw']], castWithNamedType($itemsType, [['label' => 'raw']], $itemsParameter));
        $castItems = castWithNamedType($itemsType, [['label' => 'typed']], $itemsParameter, 'list<Item>');
        self::assertInstanceOf(Item::class, $castItems[0]);

        $nullableParameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsNullable', 0);
        $nullableType = $nullableParameter->getType();
        self::assertInstanceOf(ReflectionNamedType::class, $nullableType);
        self::assertNull(castWithNamedType($nullableType, null, $nullableParameter));

        $iterableParameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsIterable', 0);
        $iterableType = $iterableParameter->getType();
        self::assertInstanceOf(ReflectionNamedType::class, $iterableType);
        $castIterable = castWithNamedType($iterableType, [['label' => 'iterable']], $iterableParameter, 'list<Item>');
        self::assertInstanceOf(Item::class, $castIterable[0]);

        $objectParameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsObject', 0);
        $objectType = $objectParameter->getType();
        self::assertInstanceOf(ReflectionNamedType::class, $objectType);
        $stdClass = new stdClass();
        self::assertSame($stdClass, castWithNamedType($objectType, $stdClass, $objectParameter));
        self::assertInstanceOf(stdClass::class, castWithNamedType($objectType, 5, $objectParameter));
        $resource = fopen('php://temp', 'rb');
        self::assertIsResource($resource);
        $resourceObject = castWithNamedType($objectType, $resource, $objectParameter);
        fclose($resource);
        self::assertSame([], get_object_vars($resourceObject));

        $callableParameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsCallable', 0);
        $callableType = $callableParameter->getType();
        self::assertInstanceOf(ReflectionNamedType::class, $callableType);
        $closure = static fn (): string => 'ok';
        self::assertSame($closure, castWithNamedType($callableType, $closure, $callableParameter));

        $mixedParameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsMixed', 0);
        $mixedType = $mixedParameter->getType();
        self::assertInstanceOf(ReflectionNamedType::class, $mixedType);
        self::assertSame(['mixed' => true], castWithNamedType($mixedType, ['mixed' => true], $mixedParameter));

        $itemParameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsItem', 0);
        $itemType = $itemParameter->getType();
        self::assertInstanceOf(ReflectionNamedType::class, $itemType);
        $item = new Item('instance');
        self::assertSame($item, castWithNamedType($itemType, $item, $itemParameter));
        $fromArray = castWithNamedType($itemType, ['label' => 'created'], $itemParameter);
        self::assertInstanceOf(Item::class, $fromArray);
        self::assertSame('created', $fromArray->label);

        $collectionParameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsCollection', 0);
        $collectionType = $collectionParameter->getType();
        self::assertInstanceOf(ReflectionNamedType::class, $collectionType);
        $collection = castWithNamedType(
            $collectionType,
            [['label' => 'wrapped']],
            $collectionParameter,
            ListCollection::class . '<Item>',
        );
        self::assertInstanceOf(ListCollection::class, $collection);
        self::assertInstanceOf(Item::class, $collection->items[0]);

        $noConstructorParameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsNoConstructor', 0);
        $noConstructorType = $noConstructorParameter->getType();
        self::assertInstanceOf(ReflectionNamedType::class, $noConstructorType);
        $noConstructor = castWithNamedType($noConstructorType, ['label' => 'ignored'], $noConstructorParameter);
        self::assertInstanceOf(NoConstructorItem::class, $noConstructor);
        self::assertSame('generated', $noConstructor->label);

        $selfParameter = (new ReflectionMethod(SelfReferencing::class, 'acceptsSelf'))->getParameters()[0];
        $selfType = $selfParameter->getType();
        self::assertInstanceOf(ReflectionNamedType::class, $selfType);
        $self = new SelfReferencing();
        self::assertSame($self, castWithNamedType($selfType, $self, $selfParameter));

        if (PHP_VERSION_ID >= 80100) {
            $statusParameter = new ReflectionParameter('StorybookPhp\\EnumFixture\\acceptsStatus', 0);
            $statusType = $statusParameter->getType();
            self::assertInstanceOf(ReflectionNamedType::class, $statusType);
            self::assertSame(Status::Draft, castWithNamedType($statusType, 'draft', $statusParameter));
        }

        if (PHP_VERSION_ID >= 80200) {
            $trueParameter = (new ReflectionFunction(eval('return function (true $value): true { return $value; };')))
                ->getParameters()[0];
            $trueType = $trueParameter->getType();
            self::assertInstanceOf(ReflectionNamedType::class, $trueType);
            self::assertTrue(castWithNamedType($trueType, false, $trueParameter));

            $falseParameter = (new ReflectionFunction(eval('return function (false $value): false { return $value; };')))
                ->getParameters()[0];
            $falseType = $falseParameter->getType();
            self::assertInstanceOf(ReflectionNamedType::class, $falseType);
            self::assertFalse(castWithNamedType($falseType, true, $falseParameter));

            $nullParameter = (new ReflectionFunction(eval('return function (null $value): null { return $value; };')))
                ->getParameters()[0];
            $nullType = $nullParameter->getType();
            self::assertInstanceOf(ReflectionNamedType::class, $nullType);
            self::assertNull(castWithNamedType($nullType, 'value', $nullParameter));
        }
    }

    public function testListAndParamDocTypeHelpersResolveOverrides(): void
    {
        self::assertTrue(isListArray(['a', 'b']));
        self::assertFalse(isListArray([1 => 'a']));

        $method = new ReflectionMethod(ExampleRenderer::class, 'render');
        $parameter = $method->getParameters()[1];
        $docTypes = parseDocBlockParamTypes($method);

        self::assertSame('list<Item>', resolveParamDocType($parameter, $docTypes));
        self::assertSame(
            'list<string>',
            resolveParamDocType(
                $parameter,
                $docTypes,
                ['type' => 'list<string>'],
            ),
        );
        self::assertSame(
            'list<int>',
            resolveParamDocType(
                $parameter,
                $docTypes,
                ['type' => 'list<int>'],
            ),
        );
        self::assertSame(
            'list<bool>',
            resolveParamDocType(
                $parameter,
                $docTypes,
                ['type' => 'list<bool>'],
            ),
        );
        self::assertSame(
            'Item[]',
            resolveParamDocType(
                $parameter,
                $docTypes,
                ['elementType' => 'Item'],
            ),
        );

        $title = $method->getParameters()[0];
        self::assertSame(
            'Item',
            resolveParamDocType(
                $title,
                $docTypes,
                ['elementType' => 'Item'],
            ),
        );

        $collectionParameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsCollection', 0);
        self::assertSame('int', buildOverrideDocType($parameter, ['type' => 'int']));
        self::assertSame('Item[]', buildOverrideDocType($parameter, ['type' => 'array', 'elementType' => 'Item']));
        self::assertSame(
            ListCollection::class . '<Item>',
            buildOverrideDocType($collectionParameter, ['type' => ListCollection::class, 'elementType' => 'Item']),
        );
        self::assertNull(buildOverrideDocType($parameter, []));
        self::assertSame(
            ListCollection::class . '<Item>',
            buildOverrideDocType($collectionParameter, ['elementType' => 'Item']),
        );
        $untyped = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsUntyped', 0);
        self::assertSame('Item[]', buildOverrideDocType($untyped, ['elementType' => 'Item']));
        self::assertSame('Item', buildOverrideDocType($title, ['elementType' => 'Item']));
    }

    public function testMatchArgsHandlesDefaultsNullablesVariadicsAndErrors(): void
    {
        self::assertSame([], matchArgs(null, []));

        $render = new ReflectionMethod(ExampleRenderer::class, 'render');
        $matched = matchArgs($render, ['title' => 'Hello', 'items' => [['label' => 'one']], 'count' => '2']);
        self::assertSame('Hello', $matched[0]);
        self::assertInstanceOf(Item::class, $matched[1][0]);
        self::assertSame(2, $matched[2]);

        $defaults = new ReflectionFunction('StorybookPhp\\TestFixture\\acceptsDefault');
        self::assertSame(['fallback', null, 1, 2], matchArgs($defaults, ['numbers' => ['1', '2']]));
        self::assertSame(['fallback', null, 3], matchArgs($defaults, ['numbers' => '3']));

        $nullable = new ReflectionFunction('StorybookPhp\\TestFixture\\acceptsNullableNoDefault');
        self::assertSame([null], matchArgs($nullable, []));

        $overrideConstructor = (new ReflectionClass(OverrideTarget::class))->getConstructor();
        self::assertInstanceOf(ReflectionMethod::class, $overrideConstructor);
        self::assertSame(
            [7, null],
            matchArgs($overrideConstructor, [], null, [
                'limit' => ['type' => 'int', 'default' => '7'],
                'subtitle' => ['nullable' => true],
            ]),
        );

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Missing required argument: title');
        matchArgs($render, ['items' => [['label' => 'missing']]]);
    }

    public function testTargetArgDefHelpersMergeScopedAndFlatPublicArgs(): void
    {
        self::assertNull(buildTargetArgDefs(null, null, 'method'));
        self::assertNull(resolvePublicArgDefForTarget('title', null, 'method'));
        self::assertSame(
            ['default' => 'scoped'],
            resolvePublicArgDefForTarget('title', ['method.title' => ['default' => 'scoped']], 'method'),
        );
        self::assertSame(
            ['default' => 'flat'],
            resolvePublicArgDefForTarget('title', ['title' => ['default' => 'flat']], 'method'),
        );
        self::assertNull(resolvePublicArgDefForTarget('missing', ['title' => ['default' => 'flat']], 'method'));
        self::assertSame(['type' => 'string'], mergeTargetArgDefForRuntime(['type' => 'string'], null));
        self::assertSame(
            ['type' => 'string', 'default' => 'flat'],
            mergeTargetArgDefForRuntime(['type' => 'string'], ['default' => 'flat']),
        );
        self::assertSame(
            ['type' => 'string'],
            mergeTargetArgDefForRuntime(['type' => 'string', 'default' => 'base'], ['default' => 'base']),
        );
        self::assertSame(
            [
                'title' => ['type' => 'string', 'default' => 'story'],
                'count' => ['type' => 'int', 'default' => '3'],
            ],
            buildTargetArgDefs(
                [
                    'title' => ['type' => 'string'],
                    'skip' => 'ignore-me',
                    'count' => ['type' => 'int'],
                ],
                [
                    'method.title' => ['default' => 'story'],
                    'count' => ['default' => '3'],
                ],
                'method',
            ),
        );
    }

    public function testStringifyBufferAndNormalizationHelpersWork(): void
    {
        self::assertSame('value', stringifyOutputValue('value'));
        self::assertSame('1', stringifyOutputValue(true));
        self::assertSame('stringable', stringifyOutputValue(new StringableValue('stringable')));
        self::assertSame('', stringifyOutputValue(['not' => 'scalar']));
        self::assertSame('value', stringifyScalarForError('value'));
        self::assertSame('array', stringifyScalarForError(['not' => 'scalar']));

        ob_start();
        echo 'buffered';
        self::assertSame('buffered', getOutputBuffer());

        self::assertSame(['alpha' => 1], normalizeStringKeyArray(['alpha' => 1], 'args'));

        try {
            normalizeStringKeyArray([0 => 'bad'], 'args');
            self::fail('Expected non-string keys to throw.');
        } catch (RuntimeException $e) {
            self::assertSame("Field 'args' must use string keys.", $e->getMessage());
        }
    }

    public function testReadRunnerRequestValidatesAllFields(): void
    {
        $request = readRunnerRequest(json_encode([
            'type' => 'function',
            'file' => self::FIXTURE_FILE,
            'sourceFile' => '/stories/FixtureAlias.php',
            'class' => null,
            'callable' => 'StorybookPhp\\TestFixture\\renderFixture',
            'args' => ['title' => 'Hello', 'items' => []],
            'publicArgDefs' => ['title' => ['type' => 'string']],
            'constructorArgDefs' => ['title' => ['type' => 'string']],
            'callableArgDefs' => [],
            'bootstrap' => null,
            'adapters' => [self::ADAPTER_FILE],
            'typeMap' => ['bindings' => []],
        ], JSON_THROW_ON_ERROR));

        self::assertSame('function', $request['type']);
        self::assertSame(self::FIXTURE_FILE, $request['file']);
        self::assertSame('/stories/FixtureAlias.php', $request['sourceFile']);
        self::assertSame(['title' => 'Hello', 'items' => []], $request['args']);
        self::assertSame(['title' => ['type' => 'string']], $request['publicArgDefs']);
        self::assertSame(['title' => ['type' => 'string']], $request['constructorArgDefs']);
        self::assertSame([], $request['callableArgDefs']);
        self::assertSame([self::ADAPTER_FILE], $request['adapters']);
        self::assertSame(['bindings' => []], $request['typeMap']);

        $cases = [
            ['123', 'Invalid request payload.'],
            [json_encode(['type' => 'bad', 'file' => self::FIXTURE_FILE], JSON_THROW_ON_ERROR), 'Request field "type" is invalid.'],
            [json_encode(['type' => 'function', 'file' => ''], JSON_THROW_ON_ERROR), 'Request field "file" is required.'],
            [json_encode(['type' => 'function', 'file' => self::FIXTURE_FILE, 'sourceFile' => 1], JSON_THROW_ON_ERROR), 'Request field "sourceFile" must be a string or null.'],
            [json_encode(['type' => 'function', 'file' => self::FIXTURE_FILE, 'class' => 1], JSON_THROW_ON_ERROR), 'Request field "class" must be a string or null.'],
            [json_encode(['type' => 'function', 'file' => self::FIXTURE_FILE, 'callable' => 1], JSON_THROW_ON_ERROR), 'Request field "callable" must be a string or null.'],
            [json_encode(['type' => 'function', 'file' => self::FIXTURE_FILE, 'args' => 'bad'], JSON_THROW_ON_ERROR), 'Request field "args" must be an object.'],
            [json_encode(['type' => 'function', 'file' => self::FIXTURE_FILE, 'publicArgDefs' => 'bad'], JSON_THROW_ON_ERROR), 'Request field "publicArgDefs" must be an object or null.'],
            [json_encode(['type' => 'function', 'file' => self::FIXTURE_FILE, 'constructorArgDefs' => 'bad'], JSON_THROW_ON_ERROR), 'Request field "constructorArgDefs" must be an object or null.'],
            [json_encode(['type' => 'function', 'file' => self::FIXTURE_FILE, 'callableArgDefs' => 'bad'], JSON_THROW_ON_ERROR), 'Request field "callableArgDefs" must be an object or null.'],
            [json_encode(['type' => 'function', 'file' => self::FIXTURE_FILE, 'bootstrap' => 1], JSON_THROW_ON_ERROR), 'Request field "bootstrap" must be a string or null.'],
            [json_encode(['type' => 'function', 'file' => self::FIXTURE_FILE, 'adapters' => 'bad'], JSON_THROW_ON_ERROR), 'Request field "adapters" must be an array or null.'],
            [json_encode(['type' => 'function', 'file' => self::FIXTURE_FILE, 'adapters' => ['']], JSON_THROW_ON_ERROR), "Field 'adapters' must be a list of non-empty strings."],
            [json_encode(['type' => 'function', 'file' => self::FIXTURE_FILE, 'typeMap' => 'bad'], JSON_THROW_ON_ERROR), 'Request field "typeMap" must be an object or null.'],
        ];

        foreach ($cases as [$payload, $message]) {
            try {
                readRunnerRequest($payload);
                self::fail('Expected request validation failure.');
            } catch (Throwable $e) {
                self::assertSame($message, $e->getMessage());
            }
        }
    }

    public function testMiddlewareHelpersAndResolveOutputHandleSupportedPaths(): void
    {
        self::assertNull(loadAdapter(null));
        self::assertNull(loadAdapter(''));

        $adapter = loadAdapter(self::ADAPTER_FILE);
        self::assertIsCallable($adapter);
        self::assertCount(1, loadAdapters([self::ADAPTER_FILE]));

        try {
            loadAdapter(self::INVALID_ADAPTER_FILE);
            self::fail('Expected invalid adapter to throw.');
        } catch (RuntimeException $e) {
            self::assertStringContainsString('Adapter file must return a callable middleware', $e->getMessage());
        }

        try {
            normalizeAdapterResponse((require self::NON_STRING_ADAPTER_FILE)([], static fn (): array => ['html' => 'ok']));
            self::fail('Expected adapter returning an invalid response to throw.');
        } catch (RuntimeException $e) {
            self::assertSame('Adapter middleware must return a response array or HTML string.', $e->getMessage());
        }

        self::assertSame(['html' => 'done'], normalizeAdapterResponse('done'));
        self::assertSame(['html' => 'done'], normalizeAdapterResponse(['html' => 'done']));

        try {
            normalizeAdapterResponse(['html' => 123]);
            self::fail('Expected invalid html field to throw.');
        } catch (RuntimeException $e) {
            self::assertSame("Adapter middleware responses must include a string 'html' field.", $e->getMessage());
        }

        $chainResponse = runAdapterMiddleware(
            [
                static function (array $context, callable $next): array {
                    self::assertSame('1.5', $context['publicArgs']['amount']);
                    self::assertSame(1.5, $context['methodArgs']['amount']);
                    $context['publicArgs']['amount'] = '2.5';
                    $response = $next($context);
                    return array_merge($response, ['html' => '[outer]' . $response['html']]);
                },
                static function (array $context, callable $next): array {
                    self::assertSame('2.5', $context['publicArgs']['amount']);
                    self::assertSame(2.5, $context['methodArgs']['amount']);
                    $response = $next($context);
                    return array_merge($response, ['html' => '[middle:' . $context['methodArgs']['amount'] . ']' . $response['html']]);
                },
            ],
            [
                'type' => 'staticMethod',
                'file' => self::FIXTURE_FILE,
                'executionFile' => self::FIXTURE_FILE,
                'class' => ExampleRenderer::class,
                'callable' => 'staticRender',
                'publicArgs' => ['amount' => '1.5'],
            ],
            static fn (array $context): array => ['html' => '[core:' . $context['methodArgs']['amount'] . ']']
        );
        self::assertSame('[outer][middle:2.5][core:2.5]', $chainResponse['html']);

        $templateResponse = runAdapterMiddleware(
            [
                static function (array $context, callable $next): array {
                    self::assertSame(['greeting' => 'hello'], $context['publicArgs']);
                    self::assertSame('hello', $context['templateArgs']['greeting']);
                    self::assertSame(4, $context['templateArgs']['count']);

                    return ['html' => $context['templateArgs']['greeting'] . ':' . $context['templateArgs']['count']];
                },
            ],
            [
                'type' => 'template',
                'file' => self::TEMPLATE_FILE,
                'executionFile' => self::TEMPLATE_FILE,
                'publicArgs' => ['greeting' => 'hello'],
                'publicArgDefs' => [
                    'greeting' => ['type' => 'string', 'required' => true, 'position' => 0, 'nullable' => false],
                    'count' => ['type' => 'int', 'required' => false, 'position' => 1, 'nullable' => false, 'default' => '4'],
                ],
            ],
            static fn (): array => ['html' => 'unreachable']
        );
        self::assertSame('hello:4', $templateResponse['html']);

        self::assertSame(
            ['template' => ['greeting' => 'hello']],
            mapPublicArgsToExecutionTargets(
                [
                    'type' => 'template',
                    'publicArgs' => ['greeting' => 'hello', 'constructor.title' => 'skip', 'method.title' => 'skip'],
                ]
            ),
        );
        self::assertSame(
            [
                'constructor' => ['id' => '1'],
                'method' => ['title' => 'scoped'],
            ],
            mapPublicArgsToExecutionTargets(
                [
                    'type' => 'classMethod',
                    'publicArgs' => ['constructor.id' => '1', 'title' => 'flat', 'method.title' => 'scoped'],
                    'constructorArgDefs' => ['id' => ['type' => 'int']],
                    'callableArgDefs' => ['title' => ['type' => 'string']],
                ],
            ),
        );
        self::assertSame(
            [
                'constructor' => ['id' => '1', 'shared' => 'value'],
                'method' => ['title' => 'fallback', 'shared' => 'value'],
            ],
            mapPublicArgsToExecutionTargets(
                [
                    'type' => 'classMethod',
                    'publicArgs' => ['constructor.id' => '1', 'method.title' => 'fallback', 'shared' => 'value'],
                ],
            ),
        );
        self::assertSame(
            ['title' => 'scoped', 'count' => 2],
            projectPublicArgsToTarget(
                ['method.title' => 'scoped', 'title' => 'flat', 'count' => 2],
                ['title' => ['type' => 'string'], 'count' => ['type' => 'int']],
                'method',
            ),
        );
        self::assertSame(
            ['title' => 'ctor', 'shared' => 'value'],
            projectNamespacedPublicArgs(
                ['constructor.title' => 'ctor', 'method.title' => 'method', 'shared' => 'value'],
                'constructor',
            ),
        );
        self::assertSame(
            ['title' => 'method', 'shared' => 'value'],
            projectNamespacedPublicArgs(
                ['constructor.title' => 'ctor', 'method.title' => 'method', 'shared' => 'value'],
                'method',
            ),
        );

        $generator = static function (): Generator {
            yield 'A';
            yield new StringableValue('B');
        };
        $throwingStringable = new class {
            public function __toString(): string
            {
                throw new RuntimeException('explode');
            }
        };

        self::assertSame('AB', resolveOutput($generator(), ''));
        self::assertSame('stringable', resolveOutput(new StringableValue('stringable'), ''));
        self::assertSame('array-html', resolveOutput(['html' => 'array-html'], ''));
        self::assertSame('valuebuffer', resolveOutput('value', 'buffer'));
        self::assertSame('buffer', resolveOutput('', 'buffer'));
        self::assertSame('123', resolveOutput(123, ''));
        self::assertSame('', resolveOutput([], ''));
        self::assertSame('buffer', resolveExecutionHtml($throwingStringable, 'buffer', true));

        try {
            resolveExecutionHtml($throwingStringable, 'buffer', false);
            self::fail('Expected output resolution failure to bubble when suppression is disabled.');
        } catch (RuntimeException $e) {
            self::assertSame('explode', $e->getMessage());
        }
    }

    public function testHydrationHelpersPreserveExplicitOverridesAndValidatePlannerInputs(): void
    {
        self::assertSame([], orderResolvedArgs(null, []));

        $resolvedArgsContext = applyResolvedExecutionArgs(
            [
                'methodArgs' => ['title' => 'manual'],
                '__computedMethodArgs' => ['title' => 'computed'],
            ],
            'methodArgs',
            '__computedMethodArgs',
            ['title' => 'computed', 'count' => 2],
        );
        self::assertSame(
            ['title' => 'manual', 'count' => 2],
            $resolvedArgsContext['methodArgs'],
        );
        self::assertSame(
            ['title' => 'computed', 'count' => 2],
            $resolvedArgsContext['__computedMethodArgs'],
        );

        $resolvedValueContext = applyResolvedExecutionValue(
            [
                'enumCaseValue' => 'manual',
                '__computedEnumCaseValue' => 'draft',
            ],
            'enumCaseValue',
            '__computedEnumCaseValue',
            'published',
        );
        self::assertSame('manual', $resolvedValueContext['enumCaseValue']);
        self::assertSame('published', $resolvedValueContext['__computedEnumCaseValue']);

        $plannerCases = [
            [
                'context' => [
                    'type' => 'classMethod',
                    'class' => ExampleRenderer::class,
                    'callable' => 'render',
                ],
                'message' => 'classMethod requires an execution file.',
            ],
            [
                'context' => [
                    'type' => 'staticMethod',
                    'class' => ExampleRenderer::class,
                    'callable' => 'staticRender',
                ],
                'message' => 'staticMethod requires an execution file.',
            ],
            [
                'context' => [
                    'type' => 'function',
                    'callable' => 'StorybookPhp\\TestFixture\\renderFixture',
                ],
                'message' => 'function render requires an execution file.',
            ],
        ];

        if (PHP_VERSION_ID >= 80100) {
            $plannerCases[] = [
                'context' => [
                    'type' => 'enumMethod',
                    'class' => Status::class,
                    'callable' => 'render',
                ],
                'message' => 'enumMethod requires an execution file.',
            ];
        }

        foreach ($plannerCases as $plannerCase) {
            try {
                ensureExecutionPlanner($plannerCase['context']);
                self::fail('Expected missing execution file to fail.');
            } catch (RuntimeException $e) {
                self::assertSame($plannerCase['message'], $e->getMessage());
            }
        }
    }

    public function testExecuteRunnerRequestSupportsAllRenderModes(): void
    {
        unset($GLOBALS['storybookPhpBootstrapLoaded']);

        $classResult = executeRunnerRequest([
            'type' => 'classMethod',
            'file' => self::FIXTURE_FILE,
            'class' => ExampleRenderer::class,
            'callable' => 'render',
            'args' => [
                'id' => '7',
                'item' => ['label' => 'seed'],
                'title' => 'hello',
                'items' => [['label' => 'first']],
                'count' => '3',
            ],
            'bootstrap' => self::BOOTSTRAP_FILE,
            'adapters' => [self::ADAPTER_FILE],
            'typeMap' => null,
        ]);
        self::assertSame('loaded', $GLOBALS['storybookPhpBootstrapLoaded']);
        self::assertSame(
            'classMethod|RunnerFixtures.php|buffer:|' . ExampleRenderer::class . '|hello:3:first:seed',
            $classResult['html'],
        );

        $plainClassResult = executeRunnerRequest([
            'type' => 'classMethod',
            'file' => self::FIXTURE_FILE,
            'class' => NoConstructorRenderer::class,
            'callable' => 'render',
            'args' => [],
            'bootstrap' => null,
            'adapters' => null,
            'typeMap' => null,
        ]);
        self::assertSame('plainplain-buffer:', $plainClassResult['html']);

        $staticResult = executeRunnerRequest([
            'type' => 'staticMethod',
            'file' => self::FIXTURE_FILE,
            'class' => ExampleRenderer::class,
            'callable' => 'staticRender',
            'args' => ['amount' => '2.5'],
            'bootstrap' => null,
            'adapters' => null,
            'typeMap' => null,
        ]);
        self::assertSame('static:2.5', $staticResult['html']);

        $staticAdapterResult = executeRunnerRequest([
            'type' => 'staticMethod',
            'file' => self::FIXTURE_FILE,
            'class' => ExampleRenderer::class,
            'callable' => 'staticRender',
            'args' => ['amount' => '2.5'],
            'bootstrap' => null,
            'adapters' => [self::ADAPTER_FILE],
            'typeMap' => null,
        ]);
        self::assertSame('staticMethod|RunnerFixtures.php||none|static:2.5', $staticAdapterResult['html']);

        $functionResult = executeRunnerRequest([
            'type' => 'function',
            'file' => self::FIXTURE_FILE,
            'class' => null,
            'callable' => 'StorybookPhp\\TestFixture\\renderFixture',
            'args' => [
                'title' => 'hello',
                'items' => [['label' => 'first']],
                'formatter' => ['prefix' => 'say-'],
                'numbers' => ['1', '2'],
            ],
            'bootstrap' => null,
            'adapters' => null,
            'typeMap' => ['bindings' => [FormatterInterface::class => Formatter::class]],
        ]);
        self::assertSame('say-HELLO:first:1,2func:', $functionResult['html']);

        $functionAdapterResult = executeRunnerRequest([
            'type' => 'function',
            'file' => self::FIXTURE_FILE,
            'class' => null,
            'callable' => 'StorybookPhp\\TestFixture\\renderFixture',
            'args' => [
                'title' => 'hello',
                'items' => [['label' => 'first']],
            ],
            'bootstrap' => null,
            'adapters' => [self::ADAPTER_FILE],
            'typeMap' => null,
        ]);
        self::assertSame('function|RunnerFixtures.php|func:|none|hello:first:', $functionAdapterResult['html']);

        $functionSourceAdapterResult = executeRunnerRequest([
            'type' => 'function',
            'file' => self::FIXTURE_FILE,
            'sourceFile' => '/stories/AliasFixture.php',
            'class' => null,
            'callable' => 'StorybookPhp\\TestFixture\\renderFixture',
            'args' => [
                'title' => 'hello',
                'items' => [['label' => 'first']],
            ],
            'bootstrap' => null,
            'adapters' => [self::ADAPTER_FILE],
            'typeMap' => null,
        ]);
        self::assertSame('function|AliasFixture.php|func:|none|hello:first:', $functionSourceAdapterResult['html']);

        $templateResult = executeRunnerRequest([
            'type' => 'template',
            'file' => self::TEMPLATE_FILE,
            'class' => null,
            'callable' => null,
            'args' => ['greeting' => 'hi', 'count' => 2],
            'publicArgDefs' => null,
            'bootstrap' => null,
            'adapters' => null,
            'typeMap' => null,
        ]);
        self::assertSame('hi:2', $templateResult['html']);

        $templateTypedResult = executeRunnerRequest([
            'type' => 'template',
            'file' => self::TEMPLATE_FILE,
            'class' => null,
            'callable' => null,
            'args' => ['greeting' => 'typed'],
            'publicArgDefs' => [
                'greeting' => ['type' => 'string', 'required' => true, 'position' => 0, 'nullable' => false],
                'count' => ['type' => 'int', 'required' => false, 'position' => 1, 'nullable' => false, 'default' => '4'],
            ],
            'bootstrap' => null,
            'adapters' => null,
            'typeMap' => null,
        ]);
        self::assertSame('typed:4', $templateTypedResult['html']);

        $templateAdapterResult = executeRunnerRequest([
            'type' => 'template',
            'file' => self::TEMPLATE_FILE,
            'class' => null,
            'callable' => null,
            'args' => ['greeting' => 'hi', 'count' => 2],
            'publicArgDefs' => null,
            'bootstrap' => null,
            'adapters' => [self::ADAPTER_FILE],
            'typeMap' => null,
        ]);
        self::assertSame('template|Template.php||none|null', $templateAdapterResult['html']);

        if (PHP_VERSION_ID >= 80100) {
            $enumResult = executeRunnerRequest([
                'type' => 'enumMethod',
                'file' => self::ENUM_FILE,
                'class' => Status::class,
                'callable' => 'render',
                'args' => ['_case' => 'draft', 'suffix' => '!'],
                'bootstrap' => null,
                'adapters' => null,
                'typeMap' => null,
            ]);
            self::assertSame('Draft!enum:', $enumResult['html']);

            $enumAdapterResult = executeRunnerRequest([
                'type' => 'enumMethod',
                'file' => self::ENUM_FILE,
                'class' => Status::class,
                'callable' => 'render',
                'args' => ['_case' => 'draft', 'suffix' => '!'],
                'bootstrap' => null,
                'adapters' => [self::ADAPTER_FILE],
                'typeMap' => null,
            ]);
            self::assertSame('enumMethod|EnumFixtures.php|enum:|' . Status::class . '|Draft!', $enumAdapterResult['html']);
        }
    }

    public function testExecuteRunnerRequestThrowsHelpfulErrors(): void
    {
        $cases = [
            [
                'type' => 'classMethod',
                'file' => self::FIXTURE_FILE,
                'class' => null,
                'callable' => 'render',
                'args' => [],
                'bootstrap' => null,
                'adapters' => null,
                'typeMap' => null,
                'message' => 'classMethod requires class and callable.',
            ],
            [
                'type' => 'staticMethod',
                'file' => self::FIXTURE_FILE,
                'class' => null,
                'callable' => 'render',
                'args' => [],
                'bootstrap' => null,
                'adapters' => null,
                'typeMap' => null,
                'message' => 'staticMethod requires class and callable.',
            ],
            [
                'type' => 'function',
                'file' => self::FIXTURE_FILE,
                'class' => null,
                'callable' => null,
                'args' => [],
                'bootstrap' => null,
                'adapters' => null,
                'typeMap' => null,
                'message' => 'function render requires callable.',
            ],
            [
                'type' => 'enumMethod',
                'file' => self::ENUM_FILE,
                'class' => null,
                'callable' => null,
                'args' => [],
                'bootstrap' => null,
                'adapters' => null,
                'typeMap' => null,
                'message' => 'enumMethod requires enum class and callable.',
            ],
            [
                'type' => ['bad'],
                'file' => self::FIXTURE_FILE,
                'class' => null,
                'callable' => null,
                'args' => [],
                'bootstrap' => null,
                'adapters' => null,
                'typeMap' => null,
                'message' => 'Unknown type: array',
            ],
            [
                'type' => 'unknown',
                'file' => self::FIXTURE_FILE,
                'class' => null,
                'callable' => null,
                'args' => [],
                'bootstrap' => null,
                'adapters' => null,
                'typeMap' => null,
                'message' => 'Unknown type: unknown',
            ],
        ];

        if (PHP_VERSION_ID >= 80100) {
            $cases[] = [
                'type' => 'enumMethod',
                'file' => self::FIXTURE_FILE,
                'class' => ExampleRenderer::class,
                'callable' => 'render',
                'args' => ['_case' => 'draft'],
                'bootstrap' => null,
                'adapters' => null,
                'typeMap' => null,
                'message' => "Enum '" . ExampleRenderer::class . "' is not available.",
            ];
        }

        foreach ($cases as $case) {
            try {
                executeRunnerRequest([
                    'type' => $case['type'],
                    'file' => $case['file'],
                    'class' => $case['class'],
                    'callable' => $case['callable'],
                    'args' => $case['args'],
                    'bootstrap' => $case['bootstrap'],
                    'adapters' => $case['adapters'],
                    'typeMap' => $case['typeMap'],
                ]);
                self::fail('Expected execution to fail.');
            } catch (RuntimeException $e) {
                self::assertSame($case['message'], $e->getMessage());
            }
        }
    }

    public function testRuntimeExecuteHelpersNormalizeNonStringKeys(): void
    {
        self::assertSame(
            ['title' => ['type' => 'string']],
            normalizeNamedArgDefMap([
                0 => 'skip',
                'title' => ['type' => 'string'],
            ]),
        );

        $resolved = resolveTemplateContextArgs(
            [
                'type' => 'template',
                'publicArgs' => ['fallback' => 'unused'],
                'publicArgDefs' => [
                    0 => 'skip',
                    'title' => ['type' => 'string', 'required' => true],
                    'featured' => ['type' => 'bool', 'default' => 1],
                ],
                'typeMap' => [
                    0 => 'skip',
                    'bindings' => [],
                ],
            ],
            [
                0 => 'skip',
                'title' => 'Normalized',
            ],
        );

        self::assertSame(
            [
                'title' => 'Normalized',
                'featured' => true,
            ],
            $resolved,
        );
    }

    public function testBuildEncodeAndRunHelpersProduceJsonResponses(): void
    {
        $error = buildRunnerErrorResponse(new RuntimeException('boom'));
        self::assertSame('', $error['html']);
        self::assertSame('boom', $error['error']);
        self::assertArrayHasKey('trace', $error);
        self::assertSame('{"html":"ok"}', encodeRunnerResponse(['html' => 'ok']));

        $validInput = json_encode([
            'type' => 'template',
            'file' => self::TEMPLATE_FILE,
            'class' => null,
            'callable' => null,
            'args' => ['greeting' => 'run', 'count' => 5],
            'bootstrap' => null,
            'adapters' => null,
            'typeMap' => null,
        ], JSON_THROW_ON_ERROR);
        $encoded = storybookPhpRun($validInput, false);
        self::assertSame('run:5', json_decode($encoded, true, 512, JSON_THROW_ON_ERROR)['html']);

        ob_start();
        $printed = storybookPhpRun($validInput);
        $captured = ob_get_clean();
        self::assertSame($printed, $captured);

        $errorInput = json_encode([
            'type' => 'function',
            'file' => self::FIXTURE_FILE,
            'class' => null,
            'callable' => null,
            'args' => [],
            'bootstrap' => null,
            'adapters' => null,
            'typeMap' => null,
        ], JSON_THROW_ON_ERROR);
        $errorResponse = json_decode(storybookPhpRun($errorInput, false), true, 512, JSON_THROW_ON_ERROR);
        self::assertSame('', $errorResponse['html']);
        self::assertSame('function render requires callable.', $errorResponse['error']);
    }

    /**
     * @param Closure(mixed): mixed $closure
     */
    private function namedTypeFromClosure(Closure $closure): ReflectionNamedType
    {
        $type = (new ReflectionFunction($closure))->getParameters()[0]->getType();
        self::assertInstanceOf(ReflectionNamedType::class, $type);

        return $type;
    }
}
