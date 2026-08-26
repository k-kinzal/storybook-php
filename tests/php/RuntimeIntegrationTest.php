<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;
use StorybookPhp\EnumFixture\Status;
use StorybookPhp\EnumFixture\UnitStatus;
use StorybookPhp\TestFixture\AbstractCollection;
use StorybookPhp\TestFixture\BrokenCollection;
use StorybookPhp\TestFixture\ExampleRenderer;
use StorybookPhp\TestFixture\Formatter;
use StorybookPhp\TestFixture\FormatterInterface;
use StorybookPhp\TestFixture\Item;
use StorybookPhp\TestFixture\ListCollection;
use StorybookPhp\TestFixture\ListCollectionContract;
use StorybookPhp\TestFixture\NoConstructorCollection;
use StorybookPhp\TestFixture\NoConstructorItem;
use StorybookPhp\TestFixture\NoConstructorRenderer;
use StorybookPhp\TestFixture\OverrideTarget;
use StorybookPhp\TestFixture\SelfReferencing;
use StorybookPhp\TestFixture\StringableValue;

/**
 * @covers \StorybookPhp\Runtime\Casting\castArrayElements
 * @covers \StorybookPhp\Runtime\Casting\splitUnionTypes
 * @covers \StorybookPhp\Runtime\Casting\resolveBoundTypeName
 * @covers \StorybookPhp\Runtime\Casting\castInlineNamedType
 * @covers \StorybookPhp\Runtime\Casting\isInlineBuiltinType
 * @covers \StorybookPhp\Runtime\Casting\castInlineBuiltinType
 * @covers \StorybookPhp\Runtime\Casting\castValueToObject
 * @covers \StorybookPhp\Runtime\Casting\castInlineDocTypeValue
 * @covers \StorybookPhp\Runtime\Casting\castInlineGenericValue
 * @covers \StorybookPhp\Runtime\Casting\castTemplateArgValue
 * @covers \StorybookPhp\Runtime\Casting\castTemplateArgs
 * @covers \StorybookPhp\Runtime\Casting\instantiateClassFromValue
 * @covers \StorybookPhp\Runtime\Casting\scoreClassInstantiationMatch
 * @covers \StorybookPhp\Runtime\Casting\canInstantiateCollectionWrapper
 * @covers \StorybookPhp\Runtime\Casting\reflectionTypeAcceptsArray
 * @covers \StorybookPhp\Runtime\Casting\instantiateCollectionWrapper
 * @covers \StorybookPhp\Runtime\Casting\scoreInlineNamedTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreNativeTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreLiteralTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreStringTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreIntTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreFloatTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreBoolTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreDeclaredTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreDocTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreDocUnionTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreGenericDocTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\rankDocTypeCandidates
 * @covers \StorybookPhp\Runtime\Casting\castDocTypeValue
 * @covers \StorybookPhp\Runtime\Casting\castReflectedGenericValue
 * @covers \StorybookPhp\Runtime\Casting\scoreTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\castArg
 * @covers \StorybookPhp\Runtime\Casting\castUnionArg
 * @covers \StorybookPhp\Runtime\Casting\castWithNamedType
 * @covers \StorybookPhp\Runtime\Casting\isReflectionBuiltinType
 * @covers \StorybookPhp\Runtime\Casting\castReflectionBuiltinType
 * @covers \StorybookPhp\Runtime\Casting\castDeclaredNamedType
 * @covers \StorybookPhp\Runtime\Casting\castNamedCollectionWrapper
 * @covers \StorybookPhp\Runtime\Casting\isListArray
 * @covers \StorybookPhp\Runtime\Contract\parseDocBlockParamTypes
 * @covers \StorybookPhp\Runtime\Contract\splitGenericArgs
 * @covers \StorybookPhp\Runtime\Contract\extractGenericValueType
 * @covers \StorybookPhp\Runtime\Contract\isArrayLikeType
 * @covers \StorybookPhp\Runtime\Contract\isRenderType
 * @covers \StorybookPhp\Runtime\Contract\typeExists
 * @covers \StorybookPhp\Runtime\Contract\enumTypeExists
 * @covers \StorybookPhp\Runtime\Contract\requireExistingClass
 * @covers \StorybookPhp\Runtime\Contract\resolveTypeMapBinding
 * @covers \StorybookPhp\Runtime\Contract\isBackedEnumClass
 * @covers \StorybookPhp\Runtime\Contract\resolveEnumCase
 * @covers \StorybookPhp\Runtime\Contract\findEnumCase
 * @covers \StorybookPhp\Runtime\Contract\resolveClassName
 * @covers \StorybookPhp\Runtime\Execution\normalizeNamedArgDefMap
 * @covers \StorybookPhp\Runtime\Execution\buildTargetArgDefs
 * @covers \StorybookPhp\Runtime\Execution\resolvePublicArgDefForTarget
 * @covers \StorybookPhp\Runtime\Execution\mergeTargetArgDefForRuntime
 * @covers \StorybookPhp\Runtime\Execution\stripInheritedRuntimeDefault
 * @covers \StorybookPhp\Runtime\Execution\defaultsMatchForRuntime
 * @covers \StorybookPhp\Runtime\Execution\resolveParamDocType
 * @covers \StorybookPhp\Runtime\Execution\buildOverrideDocType
 * @covers \StorybookPhp\Runtime\Execution\isRedundantDocTypeOverride
 * @covers \StorybookPhp\Runtime\Execution\normalizeRuntimeTypeName
 * @covers \StorybookPhp\Runtime\Execution\resolveArgs
 * @covers \StorybookPhp\Runtime\Execution\resolveParameterArgDef
 * @covers \StorybookPhp\Runtime\Execution\resolveVariadicArgValues
 * @covers \StorybookPhp\Runtime\Execution\resolveParameterArgValue
 * @covers \StorybookPhp\Runtime\Execution\matchArgs
 * @covers \StorybookPhp\Runtime\Execution\resolveNamedArgs
 * @covers \StorybookPhp\Runtime\Execution\hydrateExecutionContext
 * @covers \StorybookPhp\Runtime\Execution\normalizeExecutionContext
 * @covers \StorybookPhp\Runtime\Execution\normalizeExecutionContextString
 * @covers \StorybookPhp\Runtime\Execution\normalizeExecutionContextMap
 * @covers \StorybookPhp\Runtime\Execution\requireHydratedExecutionContext
 * @covers \StorybookPhp\Runtime\Execution\hydrateTemplateExecutionContext
 * @covers \StorybookPhp\Runtime\Execution\hydrateClassExecutionContext
 * @covers \StorybookPhp\Runtime\Execution\hydrateCallableExecutionContext
 * @covers \StorybookPhp\Runtime\Execution\hydrateEnumExecutionContext
 * @covers \StorybookPhp\Runtime\Execution\applyResolvedExecutionArgs
 * @covers \StorybookPhp\Runtime\Execution\applyResolvedExecutionValue
 * @covers \StorybookPhp\Runtime\Execution\resolveTemplateContextArgs
 * @covers \StorybookPhp\Runtime\Execution\orderResolvedArgs
 * @covers \StorybookPhp\Runtime\Execution\buildExecutionResponse
 * @covers \StorybookPhp\Runtime\Execution\executeCoreContext
 * @covers \StorybookPhp\Runtime\Execution\executeClassMethodContext
 * @covers \StorybookPhp\Runtime\Execution\executeStaticMethodContext
 * @covers \StorybookPhp\Runtime\Execution\executeFunctionContext
 * @covers \StorybookPhp\Runtime\Execution\executeTemplateContext
 * @covers \StorybookPhp\Runtime\Execution\executeEnumMethodContext
 * @covers \StorybookPhp\Runtime\Execution\executionPlanner
 * @covers \StorybookPhp\Runtime\Execution\plannerClassReflection
 * @covers \StorybookPhp\Runtime\Execution\plannerMethodReflection
 * @covers \StorybookPhp\Runtime\Execution\plannerFunctionReflection
 * @covers \StorybookPhp\Runtime\Execution\plannerCallableReflection
 * @covers \StorybookPhp\Runtime\Execution\plannerConstructorReflection
 * @covers \StorybookPhp\Runtime\Execution\executionContextArgs
 * @covers \StorybookPhp\Runtime\Execution\deferExecutionOutput
 * @covers \StorybookPhp\Runtime\Execution\ensureExecutionPlanner
 * @covers \StorybookPhp\Runtime\Execution\buildExecutionPlanner
 * @covers \StorybookPhp\Runtime\Execution\baseExecutionPlanner
 * @covers \StorybookPhp\Runtime\Execution\buildClassMethodPlanner
 * @covers \StorybookPhp\Runtime\Execution\buildStaticMethodPlanner
 * @covers \StorybookPhp\Runtime\Execution\buildFunctionPlanner
 * @covers \StorybookPhp\Runtime\Execution\buildEnumMethodPlanner
 * @covers \StorybookPhp\Runtime\Execution\requirePlannerTargetPair
 * @covers \StorybookPhp\Runtime\Execution\requirePlannerExecutionFile
 * @covers \StorybookPhp\Runtime\Execution\reflectPlannerClass
 * @covers \StorybookPhp\Runtime\Execution\runnerEnumExists
 * @covers \StorybookPhp\Runtime\Execution\mapPublicArgsToExecutionTargets
 * @covers \StorybookPhp\Runtime\Execution\projectPublicArgsToTarget
 * @covers \StorybookPhp\Runtime\Execution\projectNamespacedPublicArgs
 * @covers \StorybookPhp\Runtime\Execution\executeRunnerRequest
 * @covers \StorybookPhp\Runtime\Execution\executeAdapterTerminal
 * @covers \StorybookPhp\Runtime\Execution\buildRunnerExecutionContext
 * @covers \StorybookPhp\Runtime\resolveExecutionHtml
 * @covers \StorybookPhp\Runtime\run
 * @covers \StorybookPhp\Runtime\failure
 * @covers \StorybookPhp\Runtime\Transport\loadAdapter
 * @covers \StorybookPhp\Runtime\Transport\loadAdapters
 * @covers \StorybookPhp\Runtime\Transport\normalizeAdapterResponse
 * @covers \StorybookPhp\Runtime\Transport\runAdapterMiddleware
 * @covers \StorybookPhp\Runtime\Transport\wrapAdapterMiddleware
 * @covers \StorybookPhp\Runtime\Transport\createAdapterTerminal
 * @covers \StorybookPhp\Runtime\Transport\stringifyOutputValue
 * @covers \StorybookPhp\Runtime\Transport\stringifyScalarForError
 * @covers \StorybookPhp\Runtime\Transport\getOutputBuffer
 * @covers \StorybookPhp\Runtime\Transport\requireOutputBuffer
 * @covers \StorybookPhp\Runtime\Transport\normalizeStringKeyArray
 * @covers \StorybookPhp\Runtime\Transport\normalizeStringList
 * @covers \StorybookPhp\Runtime\Transport\isSequentialList
 * @covers \StorybookPhp\Runtime\Transport\readRunnerRequest
 * @covers \StorybookPhp\Runtime\Transport\decodeRunnerRequest
 * @covers \StorybookPhp\Runtime\Transport\requireRunnerRenderType
 * @covers \StorybookPhp\Runtime\Transport\requireRunnerStringField
 * @covers \StorybookPhp\Runtime\Transport\runnerOptionalStringField
 * @covers \StorybookPhp\Runtime\Transport\runnerObjectField
 * @covers \StorybookPhp\Runtime\Transport\runnerListField
 * @covers \StorybookPhp\Runtime\Transport\readRunnerStdin
 * @covers \StorybookPhp\Runtime\Transport\requireRunnerInput
 * @covers \StorybookPhp\Runtime\Transport\resolveOutput
 * @covers \StorybookPhp\Runtime\Transport\buildRunnerErrorResponse
 * @covers \StorybookPhp\Runtime\Transport\encodeRunnerResponse
 * @covers \StorybookPhp\Runtime\Transport\encodeJsonResponse
 */
final class RuntimeIntegrationTest extends TestCase
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
        self::assertSame([], \StorybookPhp\Runtime\Contract\parseDocBlockParamTypes(null));
        self::assertSame([], \StorybookPhp\Runtime\Contract\parseDocBlockParamTypes(new ReflectionFunction('StorybookPhp\\TestFixture\\noDocBlock')));
        self::assertSame(
            ['values' => 'list<float>'],
            \StorybookPhp\Runtime\Contract\parseDocBlockParamTypes(new ReflectionFunction('StorybookPhp\\TestFixture\\docPriority')),
        );
        self::assertSame(
            ['values' => 'list<int>'],
            \StorybookPhp\Runtime\Contract\parseDocBlockParamTypes(new ReflectionFunction('StorybookPhp\\TestFixture\\psalmPriority')),
        );
        self::assertSame(
            ['values' => 'list<string>'],
            \StorybookPhp\Runtime\Contract\parseDocBlockParamTypes(new ReflectionFunction('StorybookPhp\\TestFixture\\paramOnly')),
        );
    }

    public function testGenericHelpersResolveArrayAndWrapperTypes(): void
    {
        self::assertSame(['string', 'list<Foo>'], \StorybookPhp\Runtime\Contract\splitGenericArgs('string, list<Foo>'));
        self::assertSame(
            ['valueType' => Item::class, 'wrapperClass' => null],
            \StorybookPhp\Runtime\Contract\extractGenericValueType(Item::class . '[]'),
        );
        self::assertSame(
            ['valueType' => Item::class, 'wrapperClass' => null],
            \StorybookPhp\Runtime\Contract\extractGenericValueType('array<string, ' . Item::class . '>|null'),
        );
        self::assertSame(
            ['valueType' => Item::class, 'wrapperClass' => ListCollection::class],
            \StorybookPhp\Runtime\Contract\extractGenericValueType(ListCollection::class . '<' . Item::class . '>|null'),
        );
        self::assertNull(\StorybookPhp\Runtime\Contract\extractGenericValueType('string'));
        self::assertTrue(\StorybookPhp\Runtime\Contract\isArrayLikeType(Item::class . '[]'));
        self::assertTrue(\StorybookPhp\Runtime\Contract\isArrayLikeType('list<' . Item::class . '>'));
        self::assertFalse(\StorybookPhp\Runtime\Contract\isArrayLikeType(Item::class));
        self::assertTrue(\StorybookPhp\Runtime\Contract\isRenderType('function'));
        self::assertFalse(\StorybookPhp\Runtime\Contract\isRenderType('unknown'));
        self::assertSame(['Foo<Bar|Baz>', '(A&B)', 'string'], \StorybookPhp\Runtime\Casting\splitUnionTypes('Foo<Bar|Baz>|(A&B)|string'));
        self::assertTrue(\StorybookPhp\Runtime\Contract\typeExists(Item::class));
        self::assertTrue(\StorybookPhp\Runtime\Contract\typeExists(FormatterInterface::class));
        self::assertFalse(\StorybookPhp\Runtime\Contract\typeExists('StorybookPhp\\MissingType'));
        self::assertSame('Foo', \StorybookPhp\Runtime\Contract\resolveTypeMapBinding('Foo', null));
        self::assertSame('Foo', \StorybookPhp\Runtime\Contract\resolveTypeMapBinding('Foo', ['bindings' => 'invalid']));
        self::assertSame('Bar', \StorybookPhp\Runtime\Contract\resolveTypeMapBinding('Foo', ['bindings' => ['Foo' => 'Bar']]));
        self::assertSame('Foo', \StorybookPhp\Runtime\Contract\resolveTypeMapBinding('Foo', ['bindings' => ['Foo' => ['bad']]]));
    }

    public function testEnumHelpersResolveBackedAndNamedCases(): void
    {
        if (PHP_VERSION_ID < 80100) {
            self::assertFalse(\StorybookPhp\Runtime\Contract\enumTypeExists(Status::class));

            return;
        }

        self::assertTrue(\StorybookPhp\Runtime\Contract\isBackedEnumClass(Status::class));
        self::assertFalse(\StorybookPhp\Runtime\Contract\isBackedEnumClass(UnitStatus::class));
        self::assertSame(Status::Draft, \StorybookPhp\Runtime\Contract\resolveEnumCase(Status::class, Status::Draft));
        self::assertSame(Status::Published, \StorybookPhp\Runtime\Contract\resolveEnumCase(Status::class, 'published'));
        self::assertSame(UnitStatus::Pending, \StorybookPhp\Runtime\Contract\resolveEnumCase(UnitStatus::class, 'Pending'));

        try {
            \StorybookPhp\Runtime\Contract\resolveEnumCase(Status::class, 'missing');
            self::fail('Expected invalid backed enum value to fail.');
        } catch (RuntimeException $e) {
            self::assertStringContainsString('Cannot resolve enum case', $e->getMessage());
        }

        $this->expectException(RuntimeException::class);
        \StorybookPhp\Runtime\Contract\resolveEnumCase(Item::class, 'missing');
    }

    public function testResolveClassNameUsesDeclaringNamespace(): void
    {
        $parameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsItems', 0);

        self::assertSame(Item::class, \StorybookPhp\Runtime\Contract\resolveClassName('Item', $parameter));
        self::assertSame(Item::class, \StorybookPhp\Runtime\Contract\resolveClassName('\\' . Item::class, $parameter));
        self::assertNull(\StorybookPhp\Runtime\Contract\resolveClassName('MissingType', $parameter));

        $selfParameter = (new ReflectionMethod(SelfReferencing::class, 'acceptsSelf'))->getParameters()[0];
        self::assertSame(SelfReferencing::class, \StorybookPhp\Runtime\Contract\resolveClassName('self', $selfParameter));
        self::assertSame(SelfReferencing::class, \StorybookPhp\Runtime\Contract\resolveClassName('static', $selfParameter));
        self::assertNull(\StorybookPhp\Runtime\Contract\resolveClassName('parent', $selfParameter));
    }

    public function testCastArrayElementsSupportsClassesEnumsAndFallbacks(): void
    {
        $itemsParameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsItems', 0);
        $castItems = \StorybookPhp\Runtime\Casting\castArrayElements([['label' => 'alpha'], new Item('beta')], 'list<Item>', $itemsParameter);

        self::assertInstanceOf(Item::class, $castItems[0]);
        self::assertSame('alpha', $castItems[0]->label);
        self::assertSame('beta', $castItems[1]->label);
        self::assertSame([['label' => 'keep']], \StorybookPhp\Runtime\Casting\castArrayElements([['label' => 'keep']], 'string', $itemsParameter));
        self::assertSame(
            [['label' => 'keep']],
            \StorybookPhp\Runtime\Casting\castArrayElements([['label' => 'keep']], 'list<Item|StringableValue>', $itemsParameter),
        );

        $nestedParameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsNestedItems', 0);
        $nested = \StorybookPhp\Runtime\Casting\castArrayElements([[['label' => 'nested']]], 'list<list<Item>>', $nestedParameter);
        self::assertInstanceOf(Item::class, $nested[0][0]);
        self::assertSame('nested', $nested[0][0]->label);

        $noConstructorParameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsNoConstructorItems', 0);
        $noConstructorItems = \StorybookPhp\Runtime\Casting\castArrayElements([[]], 'list<NoConstructorItem>', $noConstructorParameter);
        self::assertInstanceOf(NoConstructorItem::class, $noConstructorItems[0]);
        self::assertSame('generated', $noConstructorItems[0]->label);
        self::assertSame(
            [['label' => 'keep']],
            \StorybookPhp\Runtime\Casting\castArrayElements([['label' => 'keep']], 'list<MissingType>', $itemsParameter),
        );

        if (PHP_VERSION_ID >= 80100) {
            $enumParameter = new ReflectionParameter('StorybookPhp\\EnumFixture\\acceptsStatuses', 0);
            $enumValues = \StorybookPhp\Runtime\Casting\castArrayElements(['draft', 'missing'], 'list<Status>', $enumParameter);
            self::assertSame(Status::Draft, $enumValues[0]);
            self::assertSame('missing', $enumValues[1]);
        }
    }

    public function testInlineAndTemplateCastingHelpersCoverRuntimeTypeMapPaths(): void
    {
        self::assertSame('123', \StorybookPhp\Runtime\Casting\castInlineNamedType('string', 123));
        self::assertSame(12, \StorybookPhp\Runtime\Casting\castInlineNamedType('int', 12));
        self::assertSame(12, \StorybookPhp\Runtime\Casting\castInlineNamedType('int', '12'));
        self::assertSame(2.5, \StorybookPhp\Runtime\Casting\castInlineNamedType('float', '2.5'));
        self::assertSame(2.5, \StorybookPhp\Runtime\Casting\castInlineNamedType('float', 2.5));
        self::assertTrue(\StorybookPhp\Runtime\Casting\castInlineNamedType('bool', 'yes'));
        self::assertTrue(\StorybookPhp\Runtime\Casting\castInlineNamedType('bool', true));
        self::assertSame(['key' => 'value'], \StorybookPhp\Runtime\Casting\castInlineNamedType('array', ['key' => 'value']));
        $inlineObject = new stdClass();
        self::assertSame($inlineObject, \StorybookPhp\Runtime\Casting\castInlineNamedType('object', $inlineObject));
        self::assertInstanceOf(stdClass::class, \StorybookPhp\Runtime\Casting\castInlineNamedType('object', ['key' => 'value']));
        $resource = fopen('php://temp', 'rb');
        self::assertIsResource($resource);
        $resourceObject = \StorybookPhp\Runtime\Casting\castInlineNamedType('object', $resource);
        fclose($resource);
        self::assertSame([], get_object_vars($resourceObject));
        $callable = static fn (): string => 'ok';
        self::assertSame($callable, \StorybookPhp\Runtime\Casting\castInlineNamedType('callable', $callable));
        self::assertSame(['mixed' => true], \StorybookPhp\Runtime\Casting\castInlineNamedType('mixed', ['mixed' => true]));
        self::assertSame(['unknown' => true], \StorybookPhp\Runtime\Casting\castInlineNamedType('unknown', ['unknown' => true]));
        self::assertTrue(\StorybookPhp\Runtime\Casting\castInlineNamedType('true', false));
        self::assertFalse(\StorybookPhp\Runtime\Casting\castInlineNamedType('false', true));
        self::assertNull(\StorybookPhp\Runtime\Casting\castInlineNamedType('null', 'value'));
        self::assertSame('raw', \StorybookPhp\Runtime\Casting\castInlineNamedType('MissingType', 'raw'));

        $boundFormatter = \StorybookPhp\Runtime\Casting\castInlineNamedType(
            FormatterInterface::class,
            ['prefix' => 'hi-'],
            ['bindings' => [FormatterInterface::class => Formatter::class]],
        );
        self::assertInstanceOf(Formatter::class, $boundFormatter);
        self::assertSame('hi-VALUE', $boundFormatter->format('value'));
        self::assertSame($boundFormatter, \StorybookPhp\Runtime\Casting\castInlineNamedType(Formatter::class, $boundFormatter));

        $noConstructor = \StorybookPhp\Runtime\Casting\castInlineNamedType(NoConstructorItem::class, []);
        self::assertInstanceOf(NoConstructorItem::class, $noConstructor);
        $positionalCollection = \StorybookPhp\Runtime\Casting\castInlineNamedType(BrokenCollection::class, [[new Item('alpha')], 'named']);
        self::assertInstanceOf(BrokenCollection::class, $positionalCollection);
        self::assertSame('alpha', $positionalCollection->items[0]->label);
        self::assertSame('named', $positionalCollection->name);
        try {
            \StorybookPhp\Runtime\Casting\castInlineNamedType(ExampleRenderer::class, '5');
            self::fail('Expected scalar fallback into multi-parameter constructors to require named args.');
        } catch (RuntimeException $e) {
            self::assertSame('Missing required argument: id', $e->getMessage());
        }

        if (PHP_VERSION_ID >= 80100) {
            self::assertSame(Status::Published, \StorybookPhp\Runtime\Casting\castInlineNamedType(Status::class, 'published'));
        }

        self::assertNull(\StorybookPhp\Runtime\Casting\castInlineDocTypeValue(null, 'string'));
        self::assertSame('value', \StorybookPhp\Runtime\Casting\castInlineDocTypeValue('value', 'mixed'));
        self::assertSame(5, \StorybookPhp\Runtime\Casting\castInlineDocTypeValue('5', '?int'));
        self::assertSame(5, \StorybookPhp\Runtime\Casting\castInlineDocTypeValue('5', 'null|int'));
        self::assertSame('draft', \StorybookPhp\Runtime\Casting\castInlineDocTypeValue('draft', 'int|string'));

        if (PHP_VERSION_ID >= 80100) {
            self::assertSame(Status::Draft, \StorybookPhp\Runtime\Casting\castInlineDocTypeValue('draft', 'int|' . Status::class));
            self::assertSame(Status::Draft, \StorybookPhp\Runtime\Casting\castInlineDocTypeValue('draft', Status::class . '|int'));
            self::assertSame(5, \StorybookPhp\Runtime\Casting\castInlineDocTypeValue('5', Status::class . '|int'));
            self::assertSame(
                'missing',
                \StorybookPhp\Runtime\Casting\castInlineDocTypeValue('missing', Status::class . '|' . UnitStatus::class),
            );
        }

        $castInlineList = \StorybookPhp\Runtime\Casting\castInlineDocTypeValue([['label' => 'alpha']], 'list<' . Item::class . '>');
        self::assertInstanceOf(Item::class, $castInlineList[0]);

        $wrappedInlineList = \StorybookPhp\Runtime\Casting\castInlineDocTypeValue([['label' => 'wrapped']], ListCollection::class . '<' . Item::class . '>');
        self::assertInstanceOf(ListCollection::class, $wrappedInlineList);
        self::assertInstanceOf(Item::class, $wrappedInlineList->items[0]);

        $noConstructorWrapped = \StorybookPhp\Runtime\Casting\castInlineDocTypeValue([['label' => 'ignored']], NoConstructorCollection::class . '<' . Item::class . '>');
        self::assertInstanceOf(NoConstructorCollection::class, $noConstructorWrapped);
        self::assertSame([], $noConstructorWrapped->items);
        $missingWrapped = \StorybookPhp\Runtime\Casting\castInlineDocTypeValue([['label' => 'raw']], 'MissingWrapper<' . Item::class . '>');
        self::assertInstanceOf(Item::class, $missingWrapped[0]);

        $templateWrapper = \StorybookPhp\Runtime\Casting\castTemplateArgValue(
            ['type' => ListCollection::class, 'elementType' => Item::class],
            [['label' => 'first']],
        );
        self::assertInstanceOf(ListCollection::class, $templateWrapper);
        self::assertInstanceOf(Item::class, $templateWrapper->items[0]);

        $templateList = \StorybookPhp\Runtime\Casting\castTemplateArgValue(
            ['type' => 'array', 'elementType' => Item::class],
            [['label' => 'second']],
        );
        self::assertInstanceOf(Item::class, $templateList[0]);
        $templateNoConstructorWrapper = \StorybookPhp\Runtime\Casting\castTemplateArgValue(
            ['type' => NoConstructorCollection::class, 'elementType' => Item::class],
            [['label' => 'third']],
        );
        self::assertInstanceOf(NoConstructorCollection::class, $templateNoConstructorWrapper);
        self::assertSame('keep', \StorybookPhp\Runtime\Casting\castTemplateArgValue(['type' => 'unknown'], 'keep'));
        self::assertSame(8, \StorybookPhp\Runtime\Casting\castTemplateArgValue(['type' => 'int'], '8'));
        self::assertNull(\StorybookPhp\Runtime\Casting\castTemplateArgValue(['type' => 'string'], null));

        $templateArgs = \StorybookPhp\Runtime\Casting\castTemplateArgs(
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
            \StorybookPhp\Runtime\Casting\castTemplateArgs([], ['title' => ['type' => 'string', 'required' => true]]);
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
            \StorybookPhp\Runtime\Casting\resolveBoundTypeName(
                'FormatterInterface',
                ['bindings' => ['FormatterInterface' => Formatter::class]],
                $formatterParameter,
            ),
        );

        self::assertSame(2, \StorybookPhp\Runtime\Casting\scoreInlineNamedTypeMatch('string', new StringableValue('score')));
        self::assertSame(1, \StorybookPhp\Runtime\Casting\scoreInlineNamedTypeMatch('float', '2.5'));
        self::assertSame(1, \StorybookPhp\Runtime\Casting\scoreInlineNamedTypeMatch('bool', 1));
        self::assertSame(1, \StorybookPhp\Runtime\Casting\scoreInlineNamedTypeMatch('bool', 'yes'));
        self::assertSame(0, \StorybookPhp\Runtime\Casting\scoreInlineNamedTypeMatch('bool', new stdClass()));
        self::assertSame(1, \StorybookPhp\Runtime\Casting\scoreInlineNamedTypeMatch('iterable', new ArrayIterator([])));
        self::assertSame(3, \StorybookPhp\Runtime\Casting\scoreInlineNamedTypeMatch('object', new stdClass()));
        self::assertSame(1, \StorybookPhp\Runtime\Casting\scoreInlineNamedTypeMatch('object', ['wrapped' => true]));
        self::assertSame(3, \StorybookPhp\Runtime\Casting\scoreInlineNamedTypeMatch('callable', static fn (): string => 'ok'));
        self::assertSame(3, \StorybookPhp\Runtime\Casting\scoreInlineNamedTypeMatch('null', null));
        self::assertSame(3, \StorybookPhp\Runtime\Casting\scoreInlineNamedTypeMatch(FormatterInterface::class, new Formatter()));
        self::assertSame(0, \StorybookPhp\Runtime\Casting\scoreInlineNamedTypeMatch('StorybookPhp\\MissingClass', ['value' => true]));
        self::assertSame(1, \StorybookPhp\Runtime\Casting\scoreInlineNamedTypeMatch(Item::class, ['label' => 'array']));

        if (PHP_VERSION_ID >= 80100) {
            self::assertSame(3, \StorybookPhp\Runtime\Casting\scoreInlineNamedTypeMatch(Status::class, Status::Draft));
        }

        $untypedParameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsUntyped', 0);
        self::assertSame(0, \StorybookPhp\Runtime\Casting\scoreDocTypeMatch('unknown', 'value', $untypedParameter));
        self::assertSame(3, \StorybookPhp\Runtime\Casting\scoreDocTypeMatch('?int', null, $untypedParameter));
        self::assertSame(2, \StorybookPhp\Runtime\Casting\scoreDocTypeMatch('?int', '4', $untypedParameter));
        self::assertSame(3, \StorybookPhp\Runtime\Casting\scoreDocTypeMatch('int|string', '4', $untypedParameter));
        self::assertSame(3, \StorybookPhp\Runtime\Casting\scoreDocTypeMatch('null|string', 'value', $untypedParameter));
        self::assertSame(4, \StorybookPhp\Runtime\Casting\scoreDocTypeMatch('list<Item>', [['label' => 'alpha']], $untypedParameter));
        self::assertSame(5, \StorybookPhp\Runtime\Casting\scoreDocTypeMatch(ListCollection::class . '<Item>', new ListCollection([]), $untypedParameter));
        self::assertSame(0, \StorybookPhp\Runtime\Casting\scoreDocTypeMatch(ListCollection::class . '<Item>', 'invalid', $untypedParameter));
    }

    public function testUnionAndWrapperCastingFallbacksCoverFailureBranches(): void
    {
        self::assertSame(5, \StorybookPhp\Runtime\Casting\castInlineDocTypeValue('5', 'float|int'));

        $inlineTiedUnion = \StorybookPhp\Runtime\Casting\castInlineDocTypeValue(['label' => 'inline'], Item::class . '|' . NoConstructorItem::class);
        self::assertInstanceOf(Item::class, $inlineTiedUnion);

        $inlineFallbackUnion = \StorybookPhp\Runtime\Casting\castInlineDocTypeValue(
            ['label' => 'inline'],
            BrokenCollection::class . '<' . Item::class . '>|' . Item::class,
        );
        self::assertInstanceOf(Item::class, $inlineFallbackUnion);

        $inlineAbstractWrapper = \StorybookPhp\Runtime\Casting\castInlineDocTypeValue(
            [['label' => 'inline-abstract']],
            AbstractCollection::class . '<' . Item::class . '>',
        );
        self::assertIsArray($inlineAbstractWrapper);
        self::assertInstanceOf(Item::class, $inlineAbstractWrapper[0]);

        $untypedParameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsUntyped', 0);
        self::assertSame(5, \StorybookPhp\Runtime\Casting\castDocTypeValue('5', 'float|int', $untypedParameter));

        $docTiedUnion = \StorybookPhp\Runtime\Casting\castDocTypeValue(
            ['label' => 'doc'],
            Item::class . '|' . NoConstructorItem::class,
            $untypedParameter,
        );
        self::assertInstanceOf(Item::class, $docTiedUnion);

        $docFallbackUnion = \StorybookPhp\Runtime\Casting\castDocTypeValue(
            ['label' => 'doc'],
            BrokenCollection::class . '<Item>|' . Item::class,
            $untypedParameter,
        );
        self::assertInstanceOf(Item::class, $docFallbackUnion);

        $docAbstractWrapper = \StorybookPhp\Runtime\Casting\castDocTypeValue(
            [['label' => 'doc-abstract']],
            AbstractCollection::class . '<Item>',
            $untypedParameter,
        );
        self::assertIsArray($docAbstractWrapper);
        self::assertInstanceOf(Item::class, $docAbstractWrapper[0]);

        $templateAbstractWrapper = \StorybookPhp\Runtime\Casting\castTemplateArgValue(
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
        $castUnion = \StorybookPhp\Runtime\Casting\castArg($unionParameter, ['label' => 'named-union']);
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
        self::assertSame(3, \StorybookPhp\Runtime\Casting\scoreTypeMatch($intType, 1));
        self::assertSame(2, \StorybookPhp\Runtime\Casting\scoreTypeMatch($intType, '1'));
        self::assertSame(3, \StorybookPhp\Runtime\Casting\scoreTypeMatch($floatType, 1.5));
        self::assertSame(1, \StorybookPhp\Runtime\Casting\scoreTypeMatch($stringType, 10));
        self::assertSame(3, \StorybookPhp\Runtime\Casting\scoreTypeMatch($boolType, false));
        self::assertSame(3, \StorybookPhp\Runtime\Casting\scoreTypeMatch($arrayType, ['a']));
        self::assertSame(0, \StorybookPhp\Runtime\Casting\scoreTypeMatch($mixedType, new stdClass()));
        self::assertSame(3, \StorybookPhp\Runtime\Casting\scoreTypeMatch($classType, new Item('x')));

        $nullableParameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsNullable', 0);
        self::assertNull(\StorybookPhp\Runtime\Casting\castArg($nullableParameter, null));

        $untypedParameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsUntyped', 0);
        self::assertSame(['value' => true], \StorybookPhp\Runtime\Casting\castArg($untypedParameter, ['value' => true]));
        self::assertSame(7, \StorybookPhp\Runtime\Casting\castArg($untypedParameter, '7', 'int'));

        $unionParameter = (new ReflectionFunction(static function (int|float $value): int|float {
            return $value;
        }))->getParameters()[0];
        self::assertSame(5, \StorybookPhp\Runtime\Casting\castArg($unionParameter, 5));
        $stringUnionParameter = (new ReflectionFunction(static function (int|string $value): int|string {
            return $value;
        }))->getParameters()[0];
        self::assertSame('draft', \StorybookPhp\Runtime\Casting\castArg($stringUnionParameter, 'draft'));

        if (PHP_VERSION_ID >= 80100) {
            $enumUnion = eval('return function (int|\StorybookPhp\EnumFixture\Status $value): mixed { return $value; };');
            $enumUnionParameter = (new ReflectionFunction($enumUnion))->getParameters()[0];
            self::assertSame(Status::Draft, \StorybookPhp\Runtime\Casting\castArg($enumUnionParameter, 'draft'));

            $intersection = eval('return function (\Countable&\IteratorAggregate $value): \Countable&\IteratorAggregate { return $value; };');
            $intersectionParameter = (new ReflectionFunction($intersection))->getParameters()[0];
            $arrayObject = new ArrayObject([1]);
            self::assertSame($arrayObject, \StorybookPhp\Runtime\Casting\castArg($intersectionParameter, $arrayObject));

            $failingUnion = eval('return function (\StorybookPhp\EnumFixture\Status|\StorybookPhp\EnumFixture\UnitStatus $value): mixed { return $value; };');
            $failingUnionParameter = (new ReflectionFunction($failingUnion))->getParameters()[0];
            self::assertSame($arrayObject, \StorybookPhp\Runtime\Casting\castArg($failingUnionParameter, $arrayObject));
        }

        if (PHP_VERSION_ID >= 80200) {
            $dnf = eval('return function (\StorybookPhp\EnumFixture\Status|(\Countable&\IteratorAggregate) $value): mixed { return $value; };');
            $dnfParameter = (new ReflectionFunction($dnf))->getParameters()[0];
            $dnfValue = new ArrayObject([1]);
            self::assertSame($dnfValue, \StorybookPhp\Runtime\Casting\castArg($dnfParameter, $dnfValue));

            $trueType = $this->namedTypeFromClosure(eval('return function (true $value): true { return $value; };'));
            $falseType = $this->namedTypeFromClosure(eval('return function (false $value): false { return $value; };'));
            $nullType = $this->namedTypeFromClosure(eval('return function (null $value): null { return $value; };'));

            self::assertSame(3, \StorybookPhp\Runtime\Casting\scoreTypeMatch($trueType, true));
            self::assertSame(3, \StorybookPhp\Runtime\Casting\scoreTypeMatch($falseType, false));
            self::assertSame(2, \StorybookPhp\Runtime\Casting\scoreTypeMatch($nullType, null));
        }
    }

    public function testCastDocTypeValueSupportsGenericWrapperBindingAndFallbackCases(): void
    {
        $untypedParameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsUntyped', 0);

        self::assertSame('value', \StorybookPhp\Runtime\Casting\castDocTypeValue('value', 'unknown', $untypedParameter));
        self::assertNull(\StorybookPhp\Runtime\Casting\castDocTypeValue(null, 'string', $untypedParameter));
        self::assertSame(4, \StorybookPhp\Runtime\Casting\castDocTypeValue('4', '?int', $untypedParameter));
        self::assertSame(4, \StorybookPhp\Runtime\Casting\castDocTypeValue('4', 'null|int', $untypedParameter));
        self::assertSame('draft', \StorybookPhp\Runtime\Casting\castDocTypeValue('draft', 'int|string', $untypedParameter));

        if (PHP_VERSION_ID >= 80100) {
            self::assertSame(Status::Draft, \StorybookPhp\Runtime\Casting\castDocTypeValue('draft', 'int|' . Status::class, $untypedParameter));
            self::assertSame(Status::Draft, \StorybookPhp\Runtime\Casting\castDocTypeValue('draft', Status::class . '|int', $untypedParameter));
            self::assertSame(4, \StorybookPhp\Runtime\Casting\castDocTypeValue('4', Status::class . '|int', $untypedParameter));
            self::assertSame(
                'missing',
                \StorybookPhp\Runtime\Casting\castDocTypeValue('missing', Status::class . '|' . UnitStatus::class, $untypedParameter),
            );
        }

        $arrayItems = \StorybookPhp\Runtime\Casting\castDocTypeValue([['label' => 'doc']], 'list<Item>', $untypedParameter);
        self::assertInstanceOf(Item::class, $arrayItems[0]);

        $wrappedItems = \StorybookPhp\Runtime\Casting\castDocTypeValue([['label' => 'wrapped']], ListCollection::class . '<Item>', $untypedParameter);
        self::assertInstanceOf(ListCollection::class, $wrappedItems);
        self::assertInstanceOf(Item::class, $wrappedItems->items[0]);
        $boundWrappedItems = \StorybookPhp\Runtime\Casting\castDocTypeValue(
            [['label' => 'bound']],
            ListCollectionContract::class . '<Item>',
            $untypedParameter,
            ['bindings' => [ListCollectionContract::class => ListCollection::class]],
        );
        self::assertInstanceOf(ListCollection::class, $boundWrappedItems);
        self::assertInstanceOf(Item::class, $boundWrappedItems->items[0]);

        $noConstructorWrapped = \StorybookPhp\Runtime\Casting\castDocTypeValue([['label' => 'wrapped']], NoConstructorCollection::class . '<Item>', $untypedParameter);
        self::assertInstanceOf(NoConstructorCollection::class, $noConstructorWrapped);
        $missingWrapped = \StorybookPhp\Runtime\Casting\castDocTypeValue([['label' => 'wrapped']], 'MissingWrapper<Item>', $untypedParameter);
        self::assertInstanceOf(Item::class, $missingWrapped[0]);

        $boundFormatter = \StorybookPhp\Runtime\Casting\castDocTypeValue(
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
        self::assertSame('123', \StorybookPhp\Runtime\Casting\castWithNamedType($stringType, 123, $stringParameter));

        $intParameter = (new ReflectionFunction(static function (int $value): int {
            return $value;
        }))->getParameters()[0];
        $intType = $intParameter->getType();
        self::assertInstanceOf(ReflectionNamedType::class, $intType);
        self::assertSame(5, \StorybookPhp\Runtime\Casting\castWithNamedType($intType, '5', $intParameter));

        $floatParameter = (new ReflectionFunction(static function (float $value): float {
            return $value;
        }))->getParameters()[0];
        $floatType = $floatParameter->getType();
        self::assertInstanceOf(ReflectionNamedType::class, $floatType);
        self::assertSame(5.5, \StorybookPhp\Runtime\Casting\castWithNamedType($floatType, 5.5, $floatParameter));
        self::assertSame(5.5, \StorybookPhp\Runtime\Casting\castWithNamedType($floatType, '5.5', $floatParameter));

        $boolParameter = (new ReflectionFunction(static function (bool $value): bool {
            return $value;
        }))->getParameters()[0];
        $boolType = $boolParameter->getType();
        self::assertInstanceOf(ReflectionNamedType::class, $boolType);
        self::assertTrue(\StorybookPhp\Runtime\Casting\castWithNamedType($boolType, true, $boolParameter));
        self::assertFalse(\StorybookPhp\Runtime\Casting\castWithNamedType($boolType, '0', $boolParameter));
        self::assertTrue(\StorybookPhp\Runtime\Casting\castWithNamedType($boolType, 'yes', $boolParameter));

        $itemsParameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsItems', 0);
        $itemsType = $itemsParameter->getType();
        self::assertInstanceOf(ReflectionNamedType::class, $itemsType);
        self::assertSame([['label' => 'raw']], \StorybookPhp\Runtime\Casting\castWithNamedType($itemsType, [['label' => 'raw']], $itemsParameter));
        $castItems = \StorybookPhp\Runtime\Casting\castWithNamedType($itemsType, [['label' => 'typed']], $itemsParameter, 'list<Item>');
        self::assertInstanceOf(Item::class, $castItems[0]);

        $nullableParameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsNullable', 0);
        $nullableType = $nullableParameter->getType();
        self::assertInstanceOf(ReflectionNamedType::class, $nullableType);
        self::assertNull(\StorybookPhp\Runtime\Casting\castWithNamedType($nullableType, null, $nullableParameter));

        $iterableParameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsIterable', 0);
        $iterableType = $iterableParameter->getType();
        self::assertInstanceOf(ReflectionNamedType::class, $iterableType);
        $castIterable = \StorybookPhp\Runtime\Casting\castWithNamedType($iterableType, [['label' => 'iterable']], $iterableParameter, 'list<Item>');
        self::assertInstanceOf(Item::class, $castIterable[0]);

        $objectParameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsObject', 0);
        $objectType = $objectParameter->getType();
        self::assertInstanceOf(ReflectionNamedType::class, $objectType);
        $stdClass = new stdClass();
        self::assertSame($stdClass, \StorybookPhp\Runtime\Casting\castWithNamedType($objectType, $stdClass, $objectParameter));
        self::assertInstanceOf(stdClass::class, \StorybookPhp\Runtime\Casting\castWithNamedType($objectType, 5, $objectParameter));
        $resource = fopen('php://temp', 'rb');
        self::assertIsResource($resource);
        $resourceObject = \StorybookPhp\Runtime\Casting\castWithNamedType($objectType, $resource, $objectParameter);
        fclose($resource);
        self::assertSame([], get_object_vars($resourceObject));

        $callableParameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsCallable', 0);
        $callableType = $callableParameter->getType();
        self::assertInstanceOf(ReflectionNamedType::class, $callableType);
        $closure = static fn (): string => 'ok';
        self::assertSame($closure, \StorybookPhp\Runtime\Casting\castWithNamedType($callableType, $closure, $callableParameter));

        $mixedParameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsMixed', 0);
        $mixedType = $mixedParameter->getType();
        self::assertInstanceOf(ReflectionNamedType::class, $mixedType);
        self::assertSame(['mixed' => true], \StorybookPhp\Runtime\Casting\castWithNamedType($mixedType, ['mixed' => true], $mixedParameter));

        $itemParameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsItem', 0);
        $itemType = $itemParameter->getType();
        self::assertInstanceOf(ReflectionNamedType::class, $itemType);
        $item = new Item('instance');
        self::assertSame($item, \StorybookPhp\Runtime\Casting\castWithNamedType($itemType, $item, $itemParameter));
        $fromArray = \StorybookPhp\Runtime\Casting\castWithNamedType($itemType, ['label' => 'created'], $itemParameter);
        self::assertInstanceOf(Item::class, $fromArray);
        self::assertSame('created', $fromArray->label);

        $collectionParameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsCollection', 0);
        $collectionType = $collectionParameter->getType();
        self::assertInstanceOf(ReflectionNamedType::class, $collectionType);
        $collection = \StorybookPhp\Runtime\Casting\castWithNamedType(
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
        $noConstructor = \StorybookPhp\Runtime\Casting\castWithNamedType($noConstructorType, ['label' => 'ignored'], $noConstructorParameter);
        self::assertInstanceOf(NoConstructorItem::class, $noConstructor);
        self::assertSame('generated', $noConstructor->label);

        $selfParameter = (new ReflectionMethod(SelfReferencing::class, 'acceptsSelf'))->getParameters()[0];
        $selfType = $selfParameter->getType();
        self::assertInstanceOf(ReflectionNamedType::class, $selfType);
        $self = new SelfReferencing();
        self::assertSame($self, \StorybookPhp\Runtime\Casting\castWithNamedType($selfType, $self, $selfParameter));

        if (PHP_VERSION_ID >= 80100) {
            $statusParameter = new ReflectionParameter('StorybookPhp\\EnumFixture\\acceptsStatus', 0);
            $statusType = $statusParameter->getType();
            self::assertInstanceOf(ReflectionNamedType::class, $statusType);
            self::assertSame(Status::Draft, \StorybookPhp\Runtime\Casting\castWithNamedType($statusType, 'draft', $statusParameter));
        }

        if (PHP_VERSION_ID >= 80200) {
            $trueParameter = (new ReflectionFunction(eval('return function (true $value): true { return $value; };')))
                ->getParameters()[0];
            $trueType = $trueParameter->getType();
            self::assertInstanceOf(ReflectionNamedType::class, $trueType);
            self::assertTrue(\StorybookPhp\Runtime\Casting\castWithNamedType($trueType, false, $trueParameter));

            $falseParameter = (new ReflectionFunction(eval('return function (false $value): false { return $value; };')))
                ->getParameters()[0];
            $falseType = $falseParameter->getType();
            self::assertInstanceOf(ReflectionNamedType::class, $falseType);
            self::assertFalse(\StorybookPhp\Runtime\Casting\castWithNamedType($falseType, true, $falseParameter));

            $nullParameter = (new ReflectionFunction(eval('return function (null $value): null { return $value; };')))
                ->getParameters()[0];
            $nullType = $nullParameter->getType();
            self::assertInstanceOf(ReflectionNamedType::class, $nullType);
            self::assertNull(\StorybookPhp\Runtime\Casting\castWithNamedType($nullType, 'value', $nullParameter));
        }
    }

    public function testListAndParamDocTypeHelpersResolveOverrides(): void
    {
        self::assertTrue(\StorybookPhp\Runtime\Casting\isListArray(['a', 'b']));
        self::assertFalse(\StorybookPhp\Runtime\Casting\isListArray([1 => 'a']));

        $method = new ReflectionMethod(ExampleRenderer::class, 'render');
        $parameter = $method->getParameters()[1];
        $docTypes = \StorybookPhp\Runtime\Contract\parseDocBlockParamTypes($method);

        self::assertSame('list<Item>', \StorybookPhp\Runtime\Execution\resolveParamDocType($parameter, $docTypes));
        self::assertSame(
            'list<string>',
            \StorybookPhp\Runtime\Execution\resolveParamDocType(
                $parameter,
                $docTypes,
                ['type' => 'list<string>'],
            ),
        );
        self::assertSame(
            'list<int>',
            \StorybookPhp\Runtime\Execution\resolveParamDocType(
                $parameter,
                $docTypes,
                ['type' => 'list<int>'],
            ),
        );
        self::assertSame(
            'list<bool>',
            \StorybookPhp\Runtime\Execution\resolveParamDocType(
                $parameter,
                $docTypes,
                ['type' => 'list<bool>'],
            ),
        );
        self::assertSame(
            'Item[]',
            \StorybookPhp\Runtime\Execution\resolveParamDocType(
                $parameter,
                $docTypes,
                ['elementType' => 'Item'],
            ),
        );

        $title = $method->getParameters()[0];
        self::assertSame(
            'Item',
            \StorybookPhp\Runtime\Execution\resolveParamDocType(
                $title,
                $docTypes,
                ['elementType' => 'Item'],
            ),
        );

        $collectionParameter = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsCollection', 0);
        self::assertSame('int', \StorybookPhp\Runtime\Execution\buildOverrideDocType($parameter, ['type' => 'int']));
        self::assertSame('Item[]', \StorybookPhp\Runtime\Execution\buildOverrideDocType($parameter, ['type' => 'array', 'elementType' => 'Item']));
        self::assertSame(
            ListCollection::class . '<Item>',
            \StorybookPhp\Runtime\Execution\buildOverrideDocType($collectionParameter, ['type' => ListCollection::class, 'elementType' => 'Item']),
        );
        self::assertNull(\StorybookPhp\Runtime\Execution\buildOverrideDocType($parameter, []));
        self::assertSame(
            ListCollection::class . '<Item>',
            \StorybookPhp\Runtime\Execution\buildOverrideDocType($collectionParameter, ['elementType' => 'Item']),
        );
        $untyped = new ReflectionParameter('StorybookPhp\\TestFixture\\acceptsUntyped', 0);
        $stringUnion = (new ReflectionFunction(static function (int|string $value): int|string {
            return $value;
        }))->getParameters()[0];
        self::assertSame('Item[]', \StorybookPhp\Runtime\Execution\buildOverrideDocType($untyped, ['elementType' => 'Item']));
        self::assertSame('Item', \StorybookPhp\Runtime\Execution\buildOverrideDocType($title, ['elementType' => 'Item']));
        self::assertNull(\StorybookPhp\Runtime\Execution\buildOverrideDocType($parameter, ['type' => 'unknown']));
        self::assertFalse(\StorybookPhp\Runtime\Execution\isRedundantDocTypeOverride($stringUnion, 'string'));
        self::assertNull(\StorybookPhp\Runtime\Execution\normalizeRuntimeTypeName('   ', $parameter));
    }

    public function testMatchArgsHandlesDefaultsNullablesVariadicsAndErrors(): void
    {
        self::assertSame([], \StorybookPhp\Runtime\Execution\matchArgs(null, []));

        $render = new ReflectionMethod(ExampleRenderer::class, 'render');
        $matched = \StorybookPhp\Runtime\Execution\matchArgs($render, ['title' => 'Hello', 'items' => [['label' => 'one']], 'count' => '2']);
        self::assertSame('Hello', $matched[0]);
        self::assertInstanceOf(Item::class, $matched[1][0]);
        self::assertSame(2, $matched[2]);

        $defaults = new ReflectionFunction('StorybookPhp\\TestFixture\\acceptsDefault');
        self::assertSame(['fallback', null, 1, 2], \StorybookPhp\Runtime\Execution\matchArgs($defaults, ['numbers' => ['1', '2']]));
        self::assertSame(['fallback', null, 3], \StorybookPhp\Runtime\Execution\matchArgs($defaults, ['numbers' => '3']));

        $nullable = new ReflectionFunction('StorybookPhp\\TestFixture\\acceptsNullableNoDefault');
        self::assertSame([null], \StorybookPhp\Runtime\Execution\matchArgs($nullable, []));

        $overrideConstructor = (new ReflectionClass(OverrideTarget::class))->getConstructor();
        self::assertInstanceOf(ReflectionMethod::class, $overrideConstructor);
        self::assertSame(
            [7, null],
            \StorybookPhp\Runtime\Execution\matchArgs($overrideConstructor, [], null, [
                'limit' => ['type' => 'int', 'default' => '7'],
                'subtitle' => ['nullable' => true],
            ]),
        );

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Missing required argument: title');
        \StorybookPhp\Runtime\Execution\matchArgs($render, ['items' => [['label' => 'missing']]]);
    }

    public function testTargetArgDefHelpersMergeScopedAndFlatPublicArgs(): void
    {
        self::assertNull(\StorybookPhp\Runtime\Execution\buildTargetArgDefs(null, null, 'method'));
        self::assertNull(\StorybookPhp\Runtime\Execution\resolvePublicArgDefForTarget('title', null, 'method'));
        self::assertSame(
            ['default' => 'scoped'],
            \StorybookPhp\Runtime\Execution\resolvePublicArgDefForTarget('title', ['method.title' => ['default' => 'scoped']], 'method'),
        );
        self::assertSame(
            ['default' => 'flat'],
            \StorybookPhp\Runtime\Execution\resolvePublicArgDefForTarget('title', ['title' => ['default' => 'flat']], 'method'),
        );
        self::assertNull(\StorybookPhp\Runtime\Execution\resolvePublicArgDefForTarget('missing', ['title' => ['default' => 'flat']], 'method'));
        self::assertSame(['type' => 'string'], \StorybookPhp\Runtime\Execution\mergeTargetArgDefForRuntime(['type' => 'string'], null));
        self::assertSame(
            ['type' => 'string', 'default' => 'flat'],
            \StorybookPhp\Runtime\Execution\mergeTargetArgDefForRuntime(['type' => 'string'], ['default' => 'flat']),
        );
        self::assertSame(
            ['type' => 'string'],
            \StorybookPhp\Runtime\Execution\mergeTargetArgDefForRuntime(['type' => 'string', 'default' => 'base'], ['default' => 'base']),
        );
        self::assertSame(
            [
                'title' => ['type' => 'string', 'default' => 'story'],
                'count' => ['type' => 'int', 'default' => '3'],
            ],
            \StorybookPhp\Runtime\Execution\buildTargetArgDefs(
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
        self::assertSame('value', \StorybookPhp\Runtime\Transport\stringifyOutputValue('value'));
        self::assertSame('1', \StorybookPhp\Runtime\Transport\stringifyOutputValue(true));
        self::assertSame('stringable', \StorybookPhp\Runtime\Transport\stringifyOutputValue(new StringableValue('stringable')));
        self::assertSame('', \StorybookPhp\Runtime\Transport\stringifyOutputValue(['not' => 'scalar']));
        self::assertSame('value', \StorybookPhp\Runtime\Transport\stringifyScalarForError('value'));
        self::assertSame('array', \StorybookPhp\Runtime\Transport\stringifyScalarForError(['not' => 'scalar']));

        ob_start();
        echo 'buffered';
        self::assertSame('buffered', \StorybookPhp\Runtime\Transport\getOutputBuffer());

        self::assertSame(['alpha' => 1], \StorybookPhp\Runtime\Transport\normalizeStringKeyArray(['alpha' => 1], 'args'));
        self::assertSame(['adapter.php'], \StorybookPhp\Runtime\Transport\normalizeStringList(['adapter.php'], 'adapters'));
        self::assertTrue(\StorybookPhp\Runtime\Transport\isSequentialList(['a', 'b']));
        self::assertFalse(\StorybookPhp\Runtime\Transport\isSequentialList(['first' => 'a']));

        try {
            \StorybookPhp\Runtime\Transport\normalizeStringKeyArray([0 => 'bad'], 'args');
            self::fail('Expected non-string keys to throw.');
        } catch (RuntimeException $e) {
            self::assertSame("Field 'args' must use string keys.", $e->getMessage());
        }

        try {
            \StorybookPhp\Runtime\Transport\normalizeStringList(['named' => 'adapter.php'], 'adapters');
            self::fail('Expected non-list adapter array to throw.');
        } catch (RuntimeException $e) {
            self::assertSame("Field 'adapters' must be a list of non-empty strings.", $e->getMessage());
        }
    }

    public function testReadRunnerRequestValidatesAllFields(): void
    {
        $request = \StorybookPhp\Runtime\Transport\readRunnerRequest(json_encode([
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
            [json_encode(['type' => 'function', 'file' => self::FIXTURE_FILE, 'adapters' => ['first' => self::ADAPTER_FILE]], JSON_THROW_ON_ERROR), "Field 'adapters' must be a list of non-empty strings."],
            [json_encode(['type' => 'function', 'file' => self::FIXTURE_FILE, 'typeMap' => 'bad'], JSON_THROW_ON_ERROR), 'Request field "typeMap" must be an object or null.'],
        ];

        foreach ($cases as [$payload, $message]) {
            try {
                \StorybookPhp\Runtime\Transport\readRunnerRequest($payload);
                self::fail('Expected request validation failure.');
            } catch (Throwable $e) {
                self::assertSame($message, $e->getMessage());
            }
        }
    }

    public function testMiddlewareHelpersAndResolveOutputHandleSupportedPaths(): void
    {
        self::assertNull(\StorybookPhp\Runtime\Transport\loadAdapter(null));
        self::assertNull(\StorybookPhp\Runtime\Transport\loadAdapter(''));

        $adapter = \StorybookPhp\Runtime\Transport\loadAdapter(self::ADAPTER_FILE);
        self::assertIsCallable($adapter);
        self::assertCount(1, \StorybookPhp\Runtime\Transport\loadAdapters([self::ADAPTER_FILE]));

        try {
            \StorybookPhp\Runtime\Transport\loadAdapter(self::INVALID_ADAPTER_FILE);
            self::fail('Expected invalid adapter to throw.');
        } catch (RuntimeException $e) {
            self::assertStringContainsString('Adapter file must return a callable middleware', $e->getMessage());
        }

        try {
            \StorybookPhp\Runtime\Transport\normalizeAdapterResponse((require self::NON_STRING_ADAPTER_FILE)([], static fn (): array => ['html' => 'ok']));
            self::fail('Expected adapter returning an invalid response to throw.');
        } catch (RuntimeException $e) {
            self::assertSame('Adapter middleware must return a response array or HTML string.', $e->getMessage());
        }

        self::assertSame(['html' => 'done'], \StorybookPhp\Runtime\Transport\normalizeAdapterResponse('done'));
        self::assertSame(['html' => 'done'], \StorybookPhp\Runtime\Transport\normalizeAdapterResponse(['html' => 'done']));

        try {
            \StorybookPhp\Runtime\Transport\normalizeAdapterResponse(['html' => 123]);
            self::fail('Expected invalid html field to throw.');
        } catch (RuntimeException $e) {
            self::assertSame("Adapter middleware responses must include a string 'html' field.", $e->getMessage());
        }

        $chainResponse = \StorybookPhp\Runtime\Transport\runAdapterMiddleware(
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

        $templateResponse = \StorybookPhp\Runtime\Transport\runAdapterMiddleware(
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
            \StorybookPhp\Runtime\Execution\mapPublicArgsToExecutionTargets(
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
            \StorybookPhp\Runtime\Execution\mapPublicArgsToExecutionTargets(
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
            \StorybookPhp\Runtime\Execution\mapPublicArgsToExecutionTargets(
                [
                    'type' => 'classMethod',
                    'publicArgs' => ['constructor.id' => '1', 'method.title' => 'fallback', 'shared' => 'value'],
                ],
            ),
        );
        self::assertSame(
            ['title' => 'scoped', 'count' => 2],
            \StorybookPhp\Runtime\Execution\projectPublicArgsToTarget(
                ['method.title' => 'scoped', 'title' => 'flat', 'count' => 2],
                ['title' => ['type' => 'string'], 'count' => ['type' => 'int']],
                'method',
            ),
        );
        self::assertSame(
            ['title' => 'ctor', 'shared' => 'value'],
            \StorybookPhp\Runtime\Execution\projectNamespacedPublicArgs(
                ['constructor.title' => 'ctor', 'method.title' => 'method', 'shared' => 'value'],
                'constructor',
            ),
        );
        self::assertSame(
            ['title' => 'method', 'shared' => 'value'],
            \StorybookPhp\Runtime\Execution\projectNamespacedPublicArgs(
                ['constructor.title' => 'ctor', 'method.title' => 'method', 'shared' => 'value'],
                'method',
            ),
        );

        $generator = static function (): Generator {
            yield 'A';
            yield new StringableValue('B');
        };
        $throwingStringable = new class () {
            public function __toString(): string
            {
                throw new RuntimeException('explode');
            }
        };

        self::assertSame('AB', \StorybookPhp\Runtime\Transport\resolveOutput($generator(), ''));
        self::assertSame('stringable', \StorybookPhp\Runtime\Transport\resolveOutput(new StringableValue('stringable'), ''));
        self::assertSame('array-html', \StorybookPhp\Runtime\Transport\resolveOutput(['html' => 'array-html'], ''));
        self::assertSame('valuebuffer', \StorybookPhp\Runtime\Transport\resolveOutput('value', 'buffer'));
        self::assertSame('buffer', \StorybookPhp\Runtime\Transport\resolveOutput('', 'buffer'));
        self::assertSame('123', \StorybookPhp\Runtime\Transport\resolveOutput(123, ''));
        self::assertSame('', \StorybookPhp\Runtime\Transport\resolveOutput([], ''));
        self::assertSame('buffer', \StorybookPhp\Runtime\resolveExecutionHtml($throwingStringable, 'buffer', true));

        try {
            \StorybookPhp\Runtime\resolveExecutionHtml($throwingStringable, 'buffer', false);
            self::fail('Expected output resolution failure to bubble when suppression is disabled.');
        } catch (RuntimeException $e) {
            self::assertSame('explode', $e->getMessage());
        }
    }

    public function testHydrationHelpersPreserveExplicitOverridesAndValidatePlannerInputs(): void
    {
        self::assertSame([], \StorybookPhp\Runtime\Execution\orderResolvedArgs(null, []));

        $resolvedArgsContext = \StorybookPhp\Runtime\Execution\applyResolvedExecutionArgs(
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

        $resolvedValueContext = \StorybookPhp\Runtime\Execution\applyResolvedExecutionValue(
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
                \StorybookPhp\Runtime\Execution\ensureExecutionPlanner($plannerCase['context']);
                self::fail('Expected missing execution file to fail.');
            } catch (RuntimeException $e) {
                self::assertSame($plannerCase['message'], $e->getMessage());
            }
        }
    }

    public function testExecuteRunnerRequestSupportsAllRenderModes(): void
    {
        unset($GLOBALS['storybookPhpBootstrapLoaded']);

        $classResult = \StorybookPhp\Runtime\Execution\executeRunnerRequest([
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

        $plainClassResult = \StorybookPhp\Runtime\Execution\executeRunnerRequest([
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

        $staticResult = \StorybookPhp\Runtime\Execution\executeRunnerRequest([
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

        $staticAdapterResult = \StorybookPhp\Runtime\Execution\executeRunnerRequest([
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

        $functionResult = \StorybookPhp\Runtime\Execution\executeRunnerRequest([
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

        $functionAdapterResult = \StorybookPhp\Runtime\Execution\executeRunnerRequest([
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

        $functionSourceAdapterResult = \StorybookPhp\Runtime\Execution\executeRunnerRequest([
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

        $templateResult = \StorybookPhp\Runtime\Execution\executeRunnerRequest([
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

        $templateTypedResult = \StorybookPhp\Runtime\Execution\executeRunnerRequest([
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

        $templateAdapterResult = \StorybookPhp\Runtime\Execution\executeRunnerRequest([
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
            $enumResult = \StorybookPhp\Runtime\Execution\executeRunnerRequest([
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

            $enumAdapterResult = \StorybookPhp\Runtime\Execution\executeRunnerRequest([
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
                \StorybookPhp\Runtime\Execution\executeRunnerRequest([
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
            \StorybookPhp\Runtime\Execution\normalizeNamedArgDefMap([
                0 => 'skip',
                'title' => ['type' => 'string'],
            ]),
        );

        $resolved = \StorybookPhp\Runtime\Execution\resolveTemplateContextArgs(
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
        $error = \StorybookPhp\Runtime\Transport\buildRunnerErrorResponse(new RuntimeException('boom'));
        self::assertSame('', $error['html']);
        self::assertSame('boom', $error['error']);
        self::assertArrayHasKey('trace', $error);
        self::assertSame('{"html":"ok"}', \StorybookPhp\Runtime\Transport\encodeRunnerResponse(['html' => 'ok']));

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
        $encoded = \StorybookPhp\Runtime\run($validInput, false);
        self::assertSame('run:5', json_decode($encoded, true, 512, JSON_THROW_ON_ERROR)['html']);

        ob_start();
        $printed = \StorybookPhp\Runtime\run($validInput);
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
        try {
            \StorybookPhp\Runtime\run($errorInput, false);
            self::fail('Expected the invalid request to fail.');
        } catch (RuntimeException $exception) {
            $errorResponse = json_decode(\StorybookPhp\Runtime\failure($exception), true, 512, JSON_THROW_ON_ERROR);
        }
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
