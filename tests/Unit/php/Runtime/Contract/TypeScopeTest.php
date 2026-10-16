<?php

declare(strict_types=1);

namespace Tests\Unit\StorybookPhp\Runtime\Contract;

use PHPUnit\Framework\TestCase;
use StorybookPhp\Runtime\Contract\TypeNode;
use StorybookPhp\Runtime\Contract\TypeScope;
use StorybookPhp\TestFixture\Hydration\Profile;
use StorybookPhp\TestFixture\Hydration\Shaped;
use StorybookPhp\TestFixture\Item;

require_once dirname(__DIR__, 4) . '/php/fixtures/HydrationFixtures.php';

/**
 * @covers \StorybookPhp\Runtime\Contract\TypeNode
 * @covers \StorybookPhp\Runtime\Contract\describeShapeNode
 * @covers \StorybookPhp\Runtime\Contract\expectTypeToken
 * @covers \StorybookPhp\Runtime\Contract\parseAtomType
 * @covers \StorybookPhp\Runtime\Contract\parseIntersectionType
 * @covers \StorybookPhp\Runtime\Contract\parseNamedType
 * @covers \StorybookPhp\Runtime\Contract\parseNullableType
 * @covers \StorybookPhp\Runtime\Contract\parsePostfixType
 * @covers \StorybookPhp\Runtime\Contract\parseShapeKey
 * @covers \StorybookPhp\Runtime\Contract\parseShapeType
 * @covers \StorybookPhp\Runtime\Contract\parseTypeArguments
 * @covers \StorybookPhp\Runtime\Contract\parseUnionType
 * @covers \StorybookPhp\Runtime\Contract\tokenizeTypeExpression
 * @covers \StorybookPhp\Runtime\Contract\typeTokenIs
 * @covers \StorybookPhp\Runtime\Contract\TypeScope
 * @covers \StorybookPhp\Runtime\Contract\typeScopeForClass
 * @covers \StorybookPhp\Runtime\Contract\typeScopeForFunction
 * @covers \StorybookPhp\Runtime\Contract\typeScopeForProperty
 * @covers \StorybookPhp\Runtime\Contract\nativeTypeScope
 * @covers \StorybookPhp\Runtime\Contract\parseDocBlockTemplates
 * @covers \StorybookPhp\Runtime\Contract\fileImports
 * @covers \StorybookPhp\Runtime\Contract\parseFileImports
 * @covers \StorybookPhp\Runtime\Contract\parseUseClause
 * @covers \StorybookPhp\Runtime\Contract\resolveTypeName
 * @covers \StorybookPhp\Runtime\Contract\resolveTypeNode
 * @covers \StorybookPhp\Runtime\Contract\typeExists
 * @covers \StorybookPhp\Runtime\Contract\enumTypeExists
 * @covers \StorybookPhp\Runtime\Contract\canonicalBuiltinTypeName
 * @covers \StorybookPhp\Runtime\Contract\mapTypeNodeNames
 * @covers \StorybookPhp\Runtime\Contract\parseTypeExpression
 * @covers \StorybookPhp\Runtime\Contract\describeTypeNode
 */
final class TypeScopeTest extends TestCase
{
    public function testTypeScopeForClassReadsNamespaceImportsAndTemplates(): void
    {
        $scope = \StorybookPhp\Runtime\Contract\typeScopeForClass(\StorybookPhp\TestFixture\Hydration\classOf(Shaped::class));

        self::assertSame('StorybookPhp\TestFixture\Hydration', $scope->namespace);
        self::assertSame(Shaped::class, $scope->className);
        self::assertNull($scope->parentClass);
        self::assertSame(Item::class, $scope->imports['aliasitem']);
        self::assertSame('StorybookPhp\TestFixture\Formatter', $scope->imports['formatter']);
        self::assertSame([], $scope->templates);
        self::assertSame(['T'], \StorybookPhp\Runtime\Contract\typeScopeForClass(\StorybookPhp\TestFixture\Hydration\classOf(\StorybookPhp\TestFixture\Hydration\TypedCollection::class))->templates);
        self::assertSame('StorybookPhp\TestFixture\Hydration\AbstractBlock', \StorybookPhp\Runtime\Contract\typeScopeForClass(\StorybookPhp\TestFixture\Hydration\classOf(\StorybookPhp\TestFixture\Hydration\ConcreteBlock::class))->parentClass);
    }

    public function testTypeScopeForFunctionMergesMethodTemplatesIntoTheClassScope(): void
    {
        $method = \StorybookPhp\Runtime\Contract\typeScopeForFunction(\StorybookPhp\TestFixture\Hydration\methodOf(Profile::class, 'setTheme'));
        $function = \StorybookPhp\Runtime\Contract\typeScopeForFunction(\StorybookPhp\TestFixture\Hydration\functionOf('StorybookPhp\TestFixture\Hydration\acceptsTemplate'));
        $closure = \StorybookPhp\Runtime\Contract\typeScopeForFunction(\StorybookPhp\TestFixture\Hydration\functionOf('strlen'));

        self::assertSame(Profile::class, $method->className);
        self::assertSame(Item::class, $method->imports['aliasitem']);
        self::assertNull($function->className);
        self::assertSame('StorybookPhp\TestFixture\Hydration', $function->namespace);
        self::assertSame(['T'], $function->templates);
        self::assertSame(Item::class, $function->imports['aliasitem']);
        self::assertSame([], $closure->imports);
    }

    public function testNativeTypeScopeKnowsOnlyTheOwningClass(): void
    {
        $method = \StorybookPhp\Runtime\Contract\nativeTypeScope(\StorybookPhp\TestFixture\Hydration\methodOf(\StorybookPhp\TestFixture\Hydration\ConcreteBlock::class, '__construct'));
        $function = \StorybookPhp\Runtime\Contract\nativeTypeScope(\StorybookPhp\TestFixture\Hydration\functionOf('StorybookPhp\TestFixture\Hydration\acceptsShape'));

        self::assertSame(\StorybookPhp\TestFixture\Hydration\ConcreteBlock::class, $method->className);
        self::assertSame('StorybookPhp\TestFixture\Hydration\AbstractBlock', $method->parentClass);
        self::assertSame([], $method->imports);
        self::assertSame('StorybookPhp\TestFixture\Hydration', $function->namespace);
        self::assertNull($function->className);
    }

    public function testTypeScopeForPropertyUsesTheDeclaringClass(): void
    {
        $scope = \StorybookPhp\Runtime\Contract\typeScopeForProperty(\StorybookPhp\TestFixture\Hydration\propertyOf(Profile::class, 'items'));

        self::assertSame(Profile::class, $scope->className);
    }

    public function testParseDocBlockTemplatesReadsEveryTemplateTag(): void
    {
        self::assertSame([], \StorybookPhp\Runtime\Contract\parseDocBlockTemplates(false));
        self::assertSame(
            ['T', 'U', 'V'],
            \StorybookPhp\Runtime\Contract\parseDocBlockTemplates("/**\n * @template T of object\n * @phpstan-template U\n * @psalm-template-covariant V\n * @template T\n */"),
        );
    }

    public function testFileImportsReadsFilesAndToleratesMissingFiles(): void
    {
        $file = dirname(__DIR__, 4) . '/php/fixtures/HydrationFixtures.php';

        self::assertSame(\StorybookPhp\Runtime\Contract\fileImports($file), \StorybookPhp\Runtime\Contract\fileImports($file));
        self::assertSame(Item::class, \StorybookPhp\Runtime\Contract\fileImports($file)['StorybookPhp\TestFixture\Hydration']['aliasitem']);
        self::assertSame([], \StorybookPhp\Runtime\Contract\fileImports(__DIR__ . '/missing-file.php'));
    }

    public function testParseFileImportsSkipsTraitClosureFunctionAndConstantUses(): void
    {
        $source = <<<'PHP'
            <?php

            declare(strict_types=1);

            namespace App\Views;

            use Lib\{A, B as C};
            use function strlen;
            use const PHP_EOL;
            use Other\D, Other\E as F;
            use Multi\{
                G,
                H as I,
            };

            #[Attr]
            final class X
            {
                use SomeTrait;

                public function f(): void
                {
                    $g = function () use ($x) {};
                    $h = X::class;
                }
            }
            PHP;

        self::assertSame(
            [
                '' => [],
                'App\Views' => ['a' => 'Lib\A', 'c' => 'Lib\B', 'd' => 'Other\D', 'f' => 'Other\E', 'g' => 'Multi\G', 'i' => 'Multi\H'],
            ],
            \StorybookPhp\Runtime\Contract\parseFileImports($source),
        );
    }

    public function testParseFileImportsFollowsBracedNamespaces(): void
    {
        $source = <<<'PHP'
            <?php
            namespace App\Views {
                use Lib\A;
            }
            namespace App\Other {
                use Lib\G;
                function f() { $g = function () use ($x) {}; }
            }
            PHP;

        self::assertSame(
            ['' => [], 'App\Views' => ['a' => 'Lib\A'], 'App\Other' => ['g' => 'Lib\G']],
            \StorybookPhp\Runtime\Contract\parseFileImports($source),
        );
    }

    public function testParseFileImportsHandlesTheGlobalNamespace(): void
    {
        self::assertSame(
            ['' => ['item' => 'Lib\Item']],
            \StorybookPhp\Runtime\Contract\parseFileImports("<?php\nuse Lib\\Item;\nclass Y {}"),
        );
    }

    public function testParseUseClauseSupportsGroupsAliasesAndSkipsNonTypes(): void
    {
        self::assertSame(['a' => 'Lib\A', 'c' => 'Lib\B'], \StorybookPhp\Runtime\Contract\parseUseClause('Lib\{A, B as C}'));
        self::assertSame(['a' => 'Lib\A', 'c' => 'Lib\B'], \StorybookPhp\Runtime\Contract\parseUseClause('\Lib\{ A , B as C , }'));
        self::assertSame(['d' => 'Other\D'], \StorybookPhp\Runtime\Contract\parseUseClause('Other\D'));
        self::assertSame(['item' => 'Item'], \StorybookPhp\Runtime\Contract\parseUseClause('Item'));
        self::assertSame([], \StorybookPhp\Runtime\Contract\parseUseClause('function strlen'));
        self::assertSame([], \StorybookPhp\Runtime\Contract\parseUseClause('const PHP_EOL'));
        self::assertSame(['a' => 'Lib\A'], \StorybookPhp\Runtime\Contract\parseUseClause('Lib\{A, function b, const C}'));
    }

    /**
     * @dataProvider providerResolvedNames
     */
    public function testResolveTypeNameFollowsPhpResolutionRules(string $name, string $resolved): void
    {
        $scope = new TypeScope(
            'StorybookPhp\TestFixture\Hydration',
            ['aliasitem' => Item::class, 'lib' => 'Vendor\Lib'],
            Profile::class,
            'StorybookPhp\TestFixture\Hydration\AbstractBlock',
        );

        self::assertSame($resolved, \StorybookPhp\Runtime\Contract\resolveTypeName($name, $scope));
    }

    /**
     * @return iterable<string, array{string, string}>
     */
    public static function providerResolvedNames(): iterable
    {
        yield 'self' => ['self', Profile::class];
        yield 'static' => ['static', Profile::class];
        yield 'this' => ['$this', Profile::class];
        yield 'parent' => ['parent', 'StorybookPhp\TestFixture\Hydration\AbstractBlock'];
        yield 'builtin alias' => ['Integer', 'int'];
        yield 'fully qualified' => ['\DateTimeImmutable', 'DateTimeImmutable'];
        yield 'import alias' => ['AliasItem', Item::class];
        yield 'import alias prefix' => ['Lib\Thing', 'Vendor\Lib\Thing'];
        yield 'namespace sibling' => ['Pair', 'StorybookPhp\TestFixture\Hydration\Pair'];
        yield 'global fallback' => ['DateTimeImmutable', 'DateTimeImmutable'];
        yield 'unknown stays namespaced' => ['Missing', 'StorybookPhp\TestFixture\Hydration\Missing'];
    }

    public function testResolveTypeNameWithoutAnOwningClassKeepsRelativeKeywords(): void
    {
        $scope = new TypeScope();

        self::assertSame('self', \StorybookPhp\Runtime\Contract\resolveTypeName('self', $scope));
        self::assertSame('parent', \StorybookPhp\Runtime\Contract\resolveTypeName('parent', $scope));
        self::assertSame('Item', \StorybookPhp\Runtime\Contract\resolveTypeName('Item', $scope));
    }

    public function testResolveTypeNodeSubstitutesTemplatesAndResolvesNames(): void
    {
        $scope = new TypeScope('StorybookPhp\TestFixture\Hydration', ['aliasitem' => Item::class], null, null, ['T', 'U']);
        $node = \StorybookPhp\Runtime\Contract\parseTypeExpression('array{a: T, b: U, c: list<AliasItem>, d: Pair}');

        self::assertSame(
            'array{a: int, b: mixed, c: list<StorybookPhp\TestFixture\Item>, d: StorybookPhp\TestFixture\Hydration\Pair}',
            \StorybookPhp\Runtime\Contract\describeTypeNode(\StorybookPhp\Runtime\Contract\resolveTypeNode($node, $scope, ['T' => new TypeNode('named', 'int')])),
        );
    }
}
