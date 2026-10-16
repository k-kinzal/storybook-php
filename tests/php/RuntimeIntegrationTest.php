<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;
use StorybookPhp\EnumFixture\Status;
use StorybookPhp\EnumFixture\UnitStatus;
use StorybookPhp\TestFixture\ClassTypeMap\BaseShelf;
use StorybookPhp\TestFixture\ClassTypeMap\Branch;
use StorybookPhp\TestFixture\ClassTypeMap\Empty_;
use StorybookPhp\TestFixture\ClassTypeMap\Holder;
use StorybookPhp\TestFixture\ClassTypeMap\LabeledShelf;
use StorybookPhp\TestFixture\ClassTypeMap\Leaf;
use StorybookPhp\TestFixture\ClassTypeMap\Shelf;
use StorybookPhp\TestFixture\ClassTypeMap\Tree;
use StorybookPhp\TestFixture\ExampleRenderer;
use StorybookPhp\TestFixture\Formatter;
use StorybookPhp\TestFixture\FormatterInterface;
use StorybookPhp\TestFixture\Hydration\Page;
use StorybookPhp\TestFixture\Hydration\ReadonlyPoint;
use StorybookPhp\TestFixture\Hydration\Widget;
use StorybookPhp\TestFixture\Item;
use StorybookPhp\TestFixture\NoConstructorRenderer;
use StorybookPhp\TestFixture\SelfReferencing;
use StorybookPhp\TestFixture\StringableValue;

/**
 * @covers \StorybookPhp\Runtime\Casting\classStateArgDefs
 * @covers \StorybookPhp\Runtime\Casting\constructorArgumentValue
 * @covers \StorybookPhp\Runtime\Contract\nativeTypeScope
 * @covers \StorybookPhp\Runtime\Casting\parameterDefaultValue
 * @covers \StorybookPhp\Runtime\Casting\argDefDocType
 * @covers \StorybookPhp\Runtime\Casting\argDefTypeString
 * @covers \StorybookPhp\Runtime\Casting\castArg
 * @covers \StorybookPhp\Runtime\Casting\hydrateValue
 * @covers \StorybookPhp\Runtime\Casting\hydrateNamedType
 * @covers \StorybookPhp\Runtime\Casting\castBuiltinValue
 * @covers \StorybookPhp\Runtime\Casting\castStructuralBuiltinValue
 * @covers \StorybookPhp\Runtime\Casting\castToString
 * @covers \StorybookPhp\Runtime\Casting\castToInt
 * @covers \StorybookPhp\Runtime\Casting\castToFloat
 * @covers \StorybookPhp\Runtime\Casting\castToBool
 * @covers \StorybookPhp\Runtime\Casting\hydrateLiteralType
 * @covers \StorybookPhp\Runtime\Casting\hydrationFailure
 * @covers \StorybookPhp\Runtime\Casting\describeHydrationValue
 * @covers \StorybookPhp\Runtime\Casting\isListArray
 * @covers \StorybookPhp\Runtime\Casting\hydrateUnionType
 * @covers \StorybookPhp\Runtime\Casting\hydrateIntersectionType
 * @covers \StorybookPhp\Runtime\Casting\hydrateGenericType
 * @covers \StorybookPhp\Runtime\Casting\hydrateArrayElements
 * @covers \StorybookPhp\Runtime\Casting\hydrateShapeType
 * @covers \StorybookPhp\Runtime\Casting\hydrateShapeFields
 * @covers \StorybookPhp\Runtime\Casting\hydrateObject
 * @covers \StorybookPhp\Runtime\Casting\hydrateGenericObject
 * @covers \StorybookPhp\Runtime\Casting\resolveHydrationClass
 * @covers \StorybookPhp\Runtime\Casting\hydrateEnumCase
 * @covers \StorybookPhp\Runtime\Casting\hydrateObjectFromMap
 * @covers \StorybookPhp\Runtime\Casting\boundStateValues
 * @covers \StorybookPhp\Runtime\Casting\constructorArguments
 * @covers \StorybookPhp\Runtime\Casting\hydrateParameterValue
 * @covers \StorybookPhp\Runtime\Casting\hydrateObjectFromList
 * @covers \StorybookPhp\Runtime\Casting\constructorWrapsList
 * @covers \StorybookPhp\Runtime\Casting\reflectionTypeAcceptsArray
 * @covers \StorybookPhp\Runtime\Casting\hydrateObjectFromScalar
 * @covers \StorybookPhp\Runtime\Casting\applyObjectState
 * @covers \StorybookPhp\Runtime\Casting\findStateSlot
 * @covers \StorybookPhp\Runtime\Casting\assignProperty
 * @covers \StorybookPhp\Runtime\Casting\describeStateSlots
 * @covers \StorybookPhp\Runtime\Casting\describeConstructor
 * @covers \StorybookPhp\Runtime\Casting\canHydrateObjectFromArray
 * @covers \StorybookPhp\Runtime\Casting\canHydrateObjectFromScalar
 * @covers \StorybookPhp\Runtime\Casting\findStateKey
 * @covers \StorybookPhp\Runtime\Casting\normalizeStateKey
 * @covers \StorybookPhp\Runtime\Casting\stringKeyedState
 * @covers \StorybookPhp\Runtime\Casting\instantiateClassFromValue
 * @covers \StorybookPhp\Runtime\Casting\castInlineDocTypeValue
 * @covers \StorybookPhp\Runtime\Casting\castTemplateArgValue
 * @covers \StorybookPhp\Runtime\Casting\castTemplateArgs
 * @covers \StorybookPhp\Runtime\Casting\scoreTypeNodeMatch
 * @covers \StorybookPhp\Runtime\Casting\selectUnionMember
 * @covers \StorybookPhp\Runtime\Casting\scoreUnionTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreIntersectionTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreNamedTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreBuiltinTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreStructuralBuiltinMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreLiteralTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreStringTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreIntTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreFloatTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreBoolTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreClassTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreGenericTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\scoreShapeTypeMatch
 * @covers \StorybookPhp\Runtime\Casting\reflectionTypeNode
 * @covers \StorybookPhp\Runtime\Casting\refineTypeNode
 * @covers \StorybookPhp\Runtime\Casting\docTypeRefines
 * @covers \StorybookPhp\Runtime\Casting\docTypeIsArrayLike
 * @covers \StorybookPhp\Runtime\Casting\docTypeIsClassLike
 * @covers \StorybookPhp\Runtime\Casting\parameterContract
 * @covers \StorybookPhp\Runtime\Casting\propertyContract
 * @covers \StorybookPhp\Runtime\Casting\documentedTypeNode
 * @covers \StorybookPhp\Runtime\Casting\parameterSlotKeys
 * @covers \StorybookPhp\Runtime\Casting\propertySlotKeys
 * @covers \StorybookPhp\Runtime\Casting\parameterLabel
 * @covers \StorybookPhp\Runtime\Casting\propertyLabel
 * @covers \StorybookPhp\Runtime\Casting\reflectionTypeAllowsNull
 * @covers \StorybookPhp\Runtime\Casting\HydrationContext
 * @covers \StorybookPhp\Runtime\Contract\TypeNode
 * @covers \StorybookPhp\Runtime\Contract\TypeScope
 * @covers \StorybookPhp\Runtime\Contract\HydrationException
 * @covers \StorybookPhp\Runtime\Contract\parseTypeExpression
 * @covers \StorybookPhp\Runtime\Contract\tokenizeTypeExpression
 * @covers \StorybookPhp\Runtime\Contract\parseUnionType
 * @covers \StorybookPhp\Runtime\Contract\parseIntersectionType
 * @covers \StorybookPhp\Runtime\Contract\parseNullableType
 * @covers \StorybookPhp\Runtime\Contract\parsePostfixType
 * @covers \StorybookPhp\Runtime\Contract\parseAtomType
 * @covers \StorybookPhp\Runtime\Contract\parseNamedType
 * @covers \StorybookPhp\Runtime\Contract\parseTypeArguments
 * @covers \StorybookPhp\Runtime\Contract\parseShapeType
 * @covers \StorybookPhp\Runtime\Contract\parseShapeKey
 * @covers \StorybookPhp\Runtime\Contract\typeTokenIs
 * @covers \StorybookPhp\Runtime\Contract\expectTypeToken
 * @covers \StorybookPhp\Runtime\Contract\describeTypeNode
 * @covers \StorybookPhp\Runtime\Contract\describeShapeNode
 * @covers \StorybookPhp\Runtime\Contract\mapTypeNodeNames
 * @covers \StorybookPhp\Runtime\Contract\typeNodeAcceptsNull
 * @covers \StorybookPhp\Runtime\Contract\stripNullFromTypeNode
 * @covers \StorybookPhp\Runtime\Contract\typeNodeMembers
 * @covers \StorybookPhp\Runtime\Contract\unionTypeNode
 * @covers \StorybookPhp\Runtime\Contract\canonicalBuiltinTypeName
 * @covers \StorybookPhp\Runtime\Contract\isArrayLikeTypeName
 * @covers \StorybookPhp\Runtime\Contract\typeScopeForClass
 * @covers \StorybookPhp\Runtime\Contract\typeScopeForFunction
 * @covers \StorybookPhp\Runtime\Contract\typeScopeForProperty
 * @covers \StorybookPhp\Runtime\Contract\parseDocBlockTemplates
 * @covers \StorybookPhp\Runtime\Contract\fileImports
 * @covers \StorybookPhp\Runtime\Contract\parseFileImports
 * @covers \StorybookPhp\Runtime\Contract\parseUseClause
 * @covers \StorybookPhp\Runtime\Contract\resolveTypeName
 * @covers \StorybookPhp\Runtime\Contract\resolveTypeNode
 * @covers \StorybookPhp\Runtime\Contract\normalizeTypeMapBindings
 * @covers \StorybookPhp\Runtime\Contract\parseBindingKey
 * @covers \StorybookPhp\Runtime\Contract\normalizeBindingValue
 * @covers \StorybookPhp\Runtime\Contract\boundTypeName
 * @covers \StorybookPhp\Runtime\Contract\slotBinding
 * @covers \StorybookPhp\Runtime\Contract\parseDocBlockParamTypes
 * @covers \StorybookPhp\Runtime\Contract\parseDocBlockVarType
 * @covers \StorybookPhp\Runtime\Contract\leadingTypeExpression
 * @covers \StorybookPhp\Runtime\Contract\whitespaceJoinsTypeExpression
 * @covers \StorybookPhp\Runtime\Contract\splitGenericArgs
 * @covers \StorybookPhp\Runtime\Contract\isRenderType
 * @covers \StorybookPhp\Runtime\Contract\typeExists
 * @covers \StorybookPhp\Runtime\Contract\enumTypeExists
 * @covers \StorybookPhp\Runtime\Contract\requireExistingClass
 * @covers \StorybookPhp\Runtime\Contract\resolveTypeMapBinding
 * @covers \StorybookPhp\Runtime\Contract\resolveTypeMapClassArgDefs
 * @covers \StorybookPhp\Runtime\Contract\collectClassEntryArgDefs
 * @covers \StorybookPhp\Runtime\Casting\resolveConstructorArgDefs
 * @covers \StorybookPhp\Runtime\Casting\layerClassArgDef
 * @covers \StorybookPhp\Runtime\Casting\isPlainArrayDocType
 * @covers \StorybookPhp\Runtime\Contract\isBackedEnumClass
 * @covers \StorybookPhp\Runtime\Contract\resolveEnumCase
 * @covers \StorybookPhp\Runtime\Contract\findEnumCase
 * @covers \StorybookPhp\Runtime\Contract\resolveClassName
 * @covers \StorybookPhp\Runtime\Execution\resolveInstanceStateArgs
 * @covers \StorybookPhp\Runtime\Execution\normalizeNamedArgDefMap
 * @covers \StorybookPhp\Runtime\Execution\buildTargetArgDefs
 * @covers \StorybookPhp\Runtime\Execution\resolvePublicArgDefForTarget
 * @covers \StorybookPhp\Runtime\Execution\mergeTargetArgDefForRuntime
 * @covers \StorybookPhp\Runtime\Execution\stripInheritedRuntimeDefault
 * @covers \StorybookPhp\Runtime\Execution\defaultsMatchForRuntime
 * @covers \StorybookPhp\Runtime\Casting\resolveParamDocType
 * @covers \StorybookPhp\Runtime\Casting\buildOverrideDocType
 * @covers \StorybookPhp\Runtime\Casting\isRedundantDocTypeOverride
 * @covers \StorybookPhp\Runtime\Casting\normalizeRuntimeTypeName
 * @covers \StorybookPhp\Runtime\Casting\resolveArgs
 * @covers \StorybookPhp\Runtime\Casting\resolveParameterArgDef
 * @covers \StorybookPhp\Runtime\Casting\resolveVariadicArgValues
 * @covers \StorybookPhp\Runtime\Casting\resolveParameterArgValue
 * @covers \StorybookPhp\Runtime\Casting\matchArgs
 * @covers \StorybookPhp\Runtime\Casting\resolveNamedArgs
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
 * @covers \StorybookPhp\Runtime\Transport\resolveExecutionHtml
 * @covers \StorybookPhp\Runtime\run
 * @covers \StorybookPhp\Runtime\failure
 * @covers \StorybookPhp\Runtime\Execution\loadAdapter
 * @covers \StorybookPhp\Runtime\Execution\loadAdapters
 * @covers \StorybookPhp\Runtime\Execution\normalizeAdapterResponse
 * @covers \StorybookPhp\Runtime\Execution\runAdapterMiddleware
 * @covers \StorybookPhp\Runtime\Execution\wrapAdapterMiddleware
 * @covers \StorybookPhp\Runtime\Execution\createAdapterTerminal
 * @covers \StorybookPhp\Runtime\Contract\stringifyOutputValue
 * @covers \StorybookPhp\Runtime\Contract\stringifyScalarForError
 * @covers \StorybookPhp\Runtime\Transport\getOutputBuffer
 * @covers \StorybookPhp\Runtime\Transport\requireOutputBuffer
 * @covers \StorybookPhp\Runtime\Contract\normalizeStringKeyArray
 * @covers \StorybookPhp\Runtime\Contract\normalizeStringList
 * @covers \StorybookPhp\Runtime\Contract\isSequentialList
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
    private const CLASS_TYPE_MAP_FILE = __DIR__ . '/fixtures/ClassTypeMapFixtures.php';
    private const HYDRATION_FILE = __DIR__ . '/fixtures/HydrationFixtures.php';
    private const READONLY_FILE = __DIR__ . '/fixtures/ReadonlyFixtures.php';
    private const TEMPLATE_FILE = __DIR__ . '/fixtures/Template.php';
    private const BOOTSTRAP_FILE = __DIR__ . '/fixtures/Bootstrap.php';
    private const ADAPTER_FILE = __DIR__ . '/fixtures/Adapter.php';
    private const INVALID_ADAPTER_FILE = __DIR__ . '/fixtures/InvalidAdapter.php';
    private const NON_STRING_ADAPTER_FILE = __DIR__ . '/fixtures/NonStringAdapter.php';

    public static function setUpBeforeClass(): void
    {
        require_once self::FIXTURE_FILE;
        require_once self::HYDRATION_FILE;
        require_once self::CLASS_TYPE_MAP_FILE;

        if (PHP_VERSION_ID >= 80100) {
            require_once self::ENUM_FILE;
            require_once self::READONLY_FILE;
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

    public function testClassTypeMapCollectsConstructorContractsAlongTheSharedConstructor(): void
    {
        $shelf = new ReflectionClass(LabeledShelf::class);

        self::assertNull(\StorybookPhp\Runtime\Contract\resolveTypeMapClassArgDefs($shelf, null));
        self::assertNull(\StorybookPhp\Runtime\Contract\resolveTypeMapClassArgDefs($shelf, ['classes' => 'invalid']));
        self::assertNull(\StorybookPhp\Runtime\Contract\resolveTypeMapClassArgDefs(
            new ReflectionClass(Empty_::class),
            ['classes' => [Empty_::class => ['args' => ['value' => 'int']]]],
        ));
        self::assertNull(\StorybookPhp\Runtime\Contract\resolveTypeMapClassArgDefs($shelf, ['classes' => [
            0 => ['args' => ['items' => 'int']],
            LabeledShelf::class => 'invalid',
            Shelf::class => ['args' => 'invalid'],
            '\\' . BaseShelf::class => ['args' => ['items' => 'Leaf[]']],
        ]]));
        self::assertSame(
            [
                'items' => ['type' => 'Leaf[]', 'default' => []],
                'label' => ['type' => 'string'],
            ],
            \StorybookPhp\Runtime\Contract\resolveTypeMapClassArgDefs($shelf, ['classes' => [
                '\\' . strtolower(LabeledShelf::class) => ['args' => [
                    'items' => ['type' => 'Leaf[]', 'default' => [], 0 => 'ignored'],
                    0 => 'ignored',
                    'skipped' => 1,
                ]],
                Shelf::class => ['args' => ['items' => 'int', 'label' => 'string']],
                BaseShelf::class => ['args' => ['label' => 'int', 'extra' => 'int']],
            ]]),
        );
    }

    public function testClassTypeMapLayersUnderExplicitConstructorArgDefs(): void
    {
        $typeMap = ['classes' => [Shelf::class => ['args' => ['items' => 'Leaf[]']]]];

        self::assertNull(\StorybookPhp\Runtime\Casting\resolveConstructorArgDefs(new ReflectionClass(Empty_::class), null, $typeMap));
        self::assertSame(
            ['label' => ['type' => 'string']],
            \StorybookPhp\Runtime\Casting\resolveConstructorArgDefs(new ReflectionClass(Shelf::class), ['label' => ['type' => 'string']], null),
        );
        self::assertSame(
            ['items' => ['type' => 'Leaf[]']],
            \StorybookPhp\Runtime\Casting\resolveConstructorArgDefs(new ReflectionClass(Shelf::class), null, $typeMap),
        );
        self::assertSame(
            [
                'items' => ['type' => 'Leaf[]', 'default' => [['tags' => ['seed']]]],
                'label' => ['type' => 'string'],
            ],
            \StorybookPhp\Runtime\Casting\resolveConstructorArgDefs(new ReflectionClass(Shelf::class), [
                'items' => ['type' => 'array', 'default' => [['tags' => ['seed']]]],
                'label' => ['type' => 'string'],
            ], $typeMap),
        );
        self::assertSame(
            ['items' => ['type' => 'Branch[]']],
            \StorybookPhp\Runtime\Casting\resolveConstructorArgDefs(new ReflectionClass(Shelf::class), [
                'items' => ['type' => 'Branch[]'],
            ], $typeMap),
        );
        self::assertSame(
            ['items' => ['type' => 'Leaf[]', 'nullable' => true]],
            \StorybookPhp\Runtime\Casting\resolveConstructorArgDefs(new ReflectionClass(Shelf::class), [
                'items' => ['type' => 'array|null', 'nullable' => true],
            ], $typeMap),
        );
        self::assertTrue(\StorybookPhp\Runtime\Casting\isPlainArrayDocType('?list'));
        self::assertTrue(\StorybookPhp\Runtime\Casting\isPlainArrayDocType('null|iterable'));
        self::assertFalse(\StorybookPhp\Runtime\Casting\isPlainArrayDocType('array<int, Leaf>'));
        self::assertFalse(\StorybookPhp\Runtime\Casting\isPlainArrayDocType('array|string'));
        self::assertFalse(\StorybookPhp\Runtime\Casting\isPlainArrayDocType('Leaf'));

        $shelf = \StorybookPhp\Runtime\Casting\instantiateClassFromValue(Shelf::class, ['label' => 'empty'], [
            'classes' => [Shelf::class => ['args' => ['items' => ['type' => 'Leaf[]', 'default' => [['tags' => ['seed']]]]]]],
        ]);
        self::assertInstanceOf(Shelf::class, $shelf);
        self::assertEquals([new Leaf(['seed'])], $shelf->items);
    }

    public function testClassTypeMapHydratesNestedUntypedArrays(): void
    {
        $value = ['branches' => [['leaves' => [['tags' => ['a', 'b']], ['tags' => ['c']]]], ['leaves' => [['tags' => ['d']]]]]];
        $typeMap = ['classes' => [
            Tree::class => ['args' => ['branches' => 'Branch[]']],
            Branch::class => ['args' => ['leaves' => ['type' => 'array', 'elementType' => 'Leaf']]],
        ]];

        $untyped = \StorybookPhp\Runtime\Casting\instantiateClassFromValue(Tree::class, $value);
        self::assertInstanceOf(Tree::class, $untyped);
        self::assertSame('|', $untyped->render());

        $tree = \StorybookPhp\Runtime\Casting\instantiateClassFromValue(Tree::class, $value, $typeMap);
        self::assertInstanceOf(Tree::class, $tree);
        self::assertSame('a/b,c|d', $tree->render());

        $holder = \StorybookPhp\Runtime\Casting\instantiateClassFromValue(Holder::class, 'solo', [
            'classes' => [Holder::class => ['args' => ['item' => 'Leaf']]],
        ]);
        self::assertInstanceOf(Holder::class, $holder);
        self::assertEquals(new Leaf(['solo']), $holder->item);

        $result = \StorybookPhp\Runtime\Execution\executeRunnerRequest([
            'type' => 'classMethod',
            'file' => self::CLASS_TYPE_MAP_FILE,
            'class' => Tree::class,
            'callable' => 'render',
            'args' => $value,
            'constructorArgDefs' => ['branches' => ['type' => 'array']],
            'bootstrap' => null,
            'adapters' => null,
            'typeMap' => $typeMap,
        ]);
        self::assertSame('a/b,c|d', $result['html']);
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
        self::assertSame('value', \StorybookPhp\Runtime\Contract\stringifyOutputValue('value'));
        self::assertSame('1', \StorybookPhp\Runtime\Contract\stringifyOutputValue(true));
        self::assertSame('stringable', \StorybookPhp\Runtime\Contract\stringifyOutputValue(new StringableValue('stringable')));
        self::assertSame('', \StorybookPhp\Runtime\Contract\stringifyOutputValue(['not' => 'scalar']));
        self::assertSame('value', \StorybookPhp\Runtime\Contract\stringifyScalarForError('value'));
        self::assertSame('array', \StorybookPhp\Runtime\Contract\stringifyScalarForError(['not' => 'scalar']));

        ob_start();
        echo 'buffered';
        self::assertSame('buffered', \StorybookPhp\Runtime\Transport\getOutputBuffer());

        self::assertSame(['alpha' => 1], \StorybookPhp\Runtime\Contract\normalizeStringKeyArray(['alpha' => 1], 'args'));
        self::assertSame(['adapter.php'], \StorybookPhp\Runtime\Contract\normalizeStringList(['adapter.php'], 'adapters'));
        self::assertTrue(\StorybookPhp\Runtime\Contract\isSequentialList(['a', 'b']));
        self::assertFalse(\StorybookPhp\Runtime\Contract\isSequentialList(['first' => 'a']));

        try {
            \StorybookPhp\Runtime\Contract\normalizeStringKeyArray([0 => 'bad'], 'args');
            self::fail('Expected non-string keys to throw.');
        } catch (RuntimeException $e) {
            self::assertSame("Field 'args' must use string keys.", $e->getMessage());
        }

        try {
            \StorybookPhp\Runtime\Contract\normalizeStringList(['named' => 'adapter.php'], 'adapters');
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
        self::assertNull(\StorybookPhp\Runtime\Execution\loadAdapter(null));
        self::assertNull(\StorybookPhp\Runtime\Execution\loadAdapter(''));

        $adapter = \StorybookPhp\Runtime\Execution\loadAdapter(self::ADAPTER_FILE);
        self::assertIsCallable($adapter);
        self::assertCount(1, \StorybookPhp\Runtime\Execution\loadAdapters([self::ADAPTER_FILE]));

        try {
            \StorybookPhp\Runtime\Execution\loadAdapter(self::INVALID_ADAPTER_FILE);
            self::fail('Expected invalid adapter to throw.');
        } catch (RuntimeException $e) {
            self::assertStringContainsString('Adapter file must return a callable middleware', $e->getMessage());
        }

        try {
            \StorybookPhp\Runtime\Execution\normalizeAdapterResponse((require self::NON_STRING_ADAPTER_FILE)([], static fn (): array => ['html' => 'ok']));
            self::fail('Expected adapter returning an invalid response to throw.');
        } catch (RuntimeException $e) {
            self::assertSame('Adapter middleware must return a response array or HTML string.', $e->getMessage());
        }

        self::assertSame(['html' => 'done'], \StorybookPhp\Runtime\Execution\normalizeAdapterResponse('done'));
        self::assertSame(['html' => 'done'], \StorybookPhp\Runtime\Execution\normalizeAdapterResponse(['html' => 'done']));

        try {
            \StorybookPhp\Runtime\Execution\normalizeAdapterResponse(['html' => 123]);
            self::fail('Expected invalid html field to throw.');
        } catch (RuntimeException $e) {
            self::assertSame("Adapter middleware responses must include a string 'html' field.", $e->getMessage());
        }

        $chainResponse = \StorybookPhp\Runtime\Execution\runAdapterMiddleware(
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

        $templateResponse = \StorybookPhp\Runtime\Execution\runAdapterMiddleware(
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
        self::assertSame('buffer', \StorybookPhp\Runtime\Transport\resolveExecutionHtml($throwingStringable, 'buffer', true));

        try {
            \StorybookPhp\Runtime\Transport\resolveExecutionHtml($throwingStringable, 'buffer', false);
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


    public function testClassMethodRenderingRewritesInstanceStateFromStoryArgs(): void
    {
        $result = \StorybookPhp\Runtime\Execution\executeRunnerRequest([
            'type' => 'classMethod',
            'file' => self::HYDRATION_FILE,
            'class' => Widget::class,
            'callable' => 'render',
            'args' => [
                'title' => 'Hello',
                'subtitle' => 'Sub',
                'theme' => 'dark',
                'shape' => ['foo' => 'alias', 'count' => '2'],
                'limit' => '3',
                'unrelated' => 'ignored',
            ],
            'bootstrap' => null,
            'adapters' => null,
            'typeMap' => null,
        ]);
        self::assertSame('Hello:Sub:dark:alias:2:3', $result['html']);

        $bound = \StorybookPhp\Runtime\Execution\executeRunnerRequest([
            'type' => 'classMethod',
            'file' => self::HYDRATION_FILE,
            'class' => Widget::class,
            'callable' => 'render',
            'args' => ['title' => 'Hello', 'shape' => ['foo' => 'alias'], 'theme' => 'ignored'],
            'bootstrap' => null,
            'adapters' => null,
            'typeMap' => ['bindings' => [
                Widget::class . '::$theme' => ['value' => 'bound'],
                Widget::class . '::$subtitle' => ['value' => 'fixed'],
                Widget::class . '::render($limit)' => ['value' => 9],
            ]],
        ]);
        self::assertSame('Hello:fixed:bound:alias:0:9', $bound['html']);
    }

    public function testClassMethodRenderingExposesStateArgsToAdapters(): void
    {
        $context = \StorybookPhp\Runtime\Execution\hydrateExecutionContext([
            'type' => 'classMethod',
            'executionFile' => self::HYDRATION_FILE,
            'class' => Widget::class,
            'callable' => 'render',
            'publicArgs' => ['title' => 'Hello', 'subtitle' => 'Sub', 'shape' => ['foo' => 'alias'], 'other' => 1],
        ]);

        self::assertSame(['title' => 'Hello'], $context['constructorArgs']);
        self::assertSame(['subtitle' => 'Sub'], $context['stateArgs']);
        self::assertSame(['subtitle' => 'Sub'], $context['__computedStateArgs']);
        self::assertSame('alias', $context['methodArgs']['shape']['foo']->label);
        self::assertSame(['stateArgs' => ['x' => 1]], array_intersect_key(\StorybookPhp\Runtime\Execution\normalizeAdapterResponse(['html' => '', 'stateArgs' => ['x' => 1]]), ['stateArgs' => true]));
    }

    public function testHydrationFailuresNameTheSlotThatRejectedTheValue(): void
    {
        try {
            \StorybookPhp\Runtime\Execution\executeRunnerRequest([
                'type' => 'classMethod',
                'file' => self::HYDRATION_FILE,
                'class' => Widget::class,
                'callable' => 'render',
                'args' => ['title' => 'Hello', 'shape' => ['foo' => ['label' => ['bad']]]],
                'bootstrap' => null,
                'adapters' => null,
                'typeMap' => null,
            ]);
            self::fail('Expected the nested hydration failure to surface.');
        } catch (RuntimeException $exception) {
            self::assertSame(
                'Cannot hydrate ' . Widget::class . '::render($shape)[foo] > ' . Item::class . '::__construct($label): expected string, received list of 1 item.',
                $exception->getMessage(),
            );
        }

        try {
            \StorybookPhp\Runtime\Execution\executeRunnerRequest([
                'type' => 'classMethod',
                'file' => self::HYDRATION_FILE,
                'class' => Page::class,
                'callable' => 'render',
                'args' => ['formatter' => ['prefix' => 'x'], 'title' => 't'],
                'bootstrap' => null,
                'adapters' => null,
                'typeMap' => null,
            ]);
            self::fail('Expected the unbound interface to be reported.');
        } catch (RuntimeException $exception) {
            self::assertStringStartsWith('Cannot hydrate ' . Page::class . '::__construct($formatter): ' . FormatterInterface::class . ' is an interface', $exception->getMessage());
        }

        $errorInput = json_encode([
            'type' => 'classMethod',
            'file' => self::HYDRATION_FILE,
            'class' => Widget::class,
            'callable' => 'render',
            'args' => ['title' => 'Hello', 'shape' => ['count' => 1]],
            'bootstrap' => null,
            'adapters' => null,
            'typeMap' => ['bindings' => ['Nope::$x' => 5]],
        ], JSON_THROW_ON_ERROR);
        try {
            \StorybookPhp\Runtime\run($errorInput, false);
            self::fail('Expected the invalid binding to fail.');
        } catch (RuntimeException $exception) {
            $errorResponse = json_decode(\StorybookPhp\Runtime\failure($exception), true, 512, JSON_THROW_ON_ERROR);
        }
        self::assertSame("Cannot hydrate value: typeMap binding 'Nope::\$x' must be a type name string or an object with 'type' and/or 'value', received int.", $errorResponse['error']);
    }

    public function testVersionSpecificTypesHydrateThroughTheSamePipeline(): void
    {
        if (PHP_VERSION_ID < 80100) {
            self::assertFalse(\StorybookPhp\Runtime\Contract\enumTypeExists(Status::class));

            return;
        }

        self::assertSame(Status::Draft, \StorybookPhp\Runtime\Casting\castInlineDocTypeValue('draft', 'int|' . Status::class));
        self::assertSame(4, \StorybookPhp\Runtime\Casting\castInlineDocTypeValue('4', Status::class . '|int'));
        self::assertSame(UnitStatus::Pending, \StorybookPhp\Runtime\Casting\castInlineDocTypeValue('Pending', UnitStatus::class));
        self::assertSame([Status::Draft, Status::Published], \StorybookPhp\Runtime\Casting\castInlineDocTypeValue(['draft', 'Published'], 'list<' . Status::class . '>'));
        self::assertSame(Status::Draft, \StorybookPhp\Runtime\Casting\castArg(new ReflectionParameter('StorybookPhp\\EnumFixture\\acceptsStatus', 0), 'draft'));

        $point = \StorybookPhp\Runtime\Casting\instantiateClassFromValue(ReadonlyPoint::class, ['x' => '1']);
        self::assertInstanceOf(ReadonlyPoint::class, $point);
        self::assertSame(1, $point->x);

        try {
            \StorybookPhp\Runtime\Casting\castInlineDocTypeValue('missing', Status::class);
            self::fail('Expected an unknown enum case to fail.');
        } catch (RuntimeException $exception) {
            self::assertSame(
                'Cannot hydrate value: expected ' . Status::class . ", received string 'missing'. Valid cases: Draft ('draft'), Published ('published').",
                $exception->getMessage(),
            );
        }

        try {
            \StorybookPhp\Runtime\Casting\applyObjectState($point, ['x' => 2], StorybookPhp\Runtime\Casting\HydrationContext::fromTypeMap(null));
            self::fail('Expected the initialised readonly property to be rejected.');
        } catch (RuntimeException $exception) {
            self::assertSame(
                'Cannot hydrate ' . ReadonlyPoint::class . '::$x: the property is readonly and was already initialised by the constructor. Pass the value as a constructor argument instead.',
                $exception->getMessage(),
            );
        }

        if (PHP_VERSION_ID >= 80200) {
            $dnf = eval('return function (\StorybookPhp\EnumFixture\Status|(\Countable&\IteratorAggregate) $value): mixed { return $value; };');
            $dnfParameter = (new ReflectionFunction($dnf))->getParameters()[0];
            $dnfValue = new ArrayObject([1]);
            self::assertSame($dnfValue, \StorybookPhp\Runtime\Casting\castArg($dnfParameter, $dnfValue));
            self::assertSame(Status::Draft, \StorybookPhp\Runtime\Casting\castArg($dnfParameter, 'draft'));

            $trueParameter = (new ReflectionFunction(eval('return function (true $value): true { return $value; };')))->getParameters()[0];
            self::assertTrue(\StorybookPhp\Runtime\Casting\castArg($trueParameter, 'yes'));
        }
    }
}
