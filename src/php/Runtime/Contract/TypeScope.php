<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime\Contract;

use ReflectionClass;
use ReflectionFunctionAbstract;
use ReflectionMethod;
use ReflectionProperty;

/**
 * Name-resolution context of a declaration: its namespace, `use` imports,
 * owning class, and visible `@template` names.
 *
 * Docblock types are written with short names, so a contract such as
 * `array{foo: Foo}` is only complete once `Foo` has been resolved through
 * this scope into a fully qualified class name.
 */
final class TypeScope
{
    /**
     * @param array<string, string> $imports lowercased alias mapped to the imported fully qualified name
     * @param list<string> $templates `@template` names declared on the class or callable
     */
    public function __construct(
        public string $namespace = '',
        public array $imports = [],
        public ?string $className = null,
        public ?string $parentClass = null,
        public array $templates = [],
    ) {
    }
}

/**
 * Builds the scope of a class declaration.
 *
 * @param ReflectionClass<object> $class
 *
 * @example Scope of a namespaced class
 *     $scope = \StorybookPhp\Runtime\Contract\typeScopeForClass(new \ReflectionClass(\StorybookPhp\Runtime\Contract\TypeScope::class));
 *     $scope->namespace // => 'StorybookPhp\Runtime\Contract'
 *     $scope->className // => 'StorybookPhp\Runtime\Contract\TypeScope'
 */
function typeScopeForClass(ReflectionClass $class): TypeScope
{
    $parent = $class->getParentClass();
    $file = $class->getFileName();

    return new TypeScope(
        $class->getNamespaceName(),
        is_string($file) ? \StorybookPhp\Runtime\Contract\fileImports($file)[$class->getNamespaceName()] ?? [] : [],
        $class->getName(),
        $parent instanceof ReflectionClass ? $parent->getName() : null,
        \StorybookPhp\Runtime\Contract\parseDocBlockTemplates($class->getDocComment()),
    );
}

/**
 * Builds the scope of a method or function, including its own `@template` names.
 */
function typeScopeForFunction(ReflectionFunctionAbstract $function): TypeScope
{
    $templates = \StorybookPhp\Runtime\Contract\parseDocBlockTemplates($function->getDocComment());
    if ($function instanceof ReflectionMethod) {
        $scope = \StorybookPhp\Runtime\Contract\typeScopeForClass($function->getDeclaringClass());

        return new TypeScope($scope->namespace, $scope->imports, $scope->className, $scope->parentClass, array_merge($scope->templates, $templates));
    }
    $file = $function->getFileName();
    $namespace = $function->getNamespaceName();

    return new TypeScope(
        $namespace,
        is_string($file) ? \StorybookPhp\Runtime\Contract\fileImports($file)[$namespace] ?? [] : [],
        null,
        null,
        $templates,
    );
}

/**
 * Builds a scope that only knows the owning class, which is enough to resolve
 * `self`, `static`, and `parent` in native declarations without reading the
 * source file.
 *
 * @example Native scope of a method
 *     $scope = \StorybookPhp\Runtime\Contract\nativeTypeScope(new \ReflectionMethod(\StorybookPhp\Runtime\Contract\TypeScope::class, '__construct'));
 *     $scope->className // => 'StorybookPhp\Runtime\Contract\TypeScope'
 *     $scope->imports // => []
 */
function nativeTypeScope(ReflectionFunctionAbstract $function): TypeScope
{
    if (!$function instanceof ReflectionMethod) {
        return new TypeScope($function->getNamespaceName());
    }
    $class = $function->getDeclaringClass();
    $parent = $class->getParentClass();

    return new TypeScope($class->getNamespaceName(), [], $class->getName(), $parent instanceof ReflectionClass ? $parent->getName() : null);
}

/**
 * Builds the scope of a property, which is the scope of its declaring class.
 */
function typeScopeForProperty(ReflectionProperty $property): TypeScope
{
    return \StorybookPhp\Runtime\Contract\typeScopeForClass($property->getDeclaringClass());
}

/**
 * Reads `@template` / `@phpstan-template` / `@psalm-template` names from a docblock.
 *
 * @return list<string>
 *
 * @example Template names
 *     \StorybookPhp\Runtime\Contract\parseDocBlockTemplates("/**\n * @template T of object\n * @phpstan-template U\n *\/") // => ['T', 'U']
 */
function parseDocBlockTemplates(string|false $docComment): array
{
    if ($docComment === false) {
        return [];
    }
    preg_match_all('/@(?:phpstan-|psalm-)?template(?:-covariant|-contravariant)?\s+([A-Za-z_][A-Za-z0-9_]*)/', $docComment, $matches);

    return array_values(array_unique($matches[1]));
}

/**
 * Returns the `use` imports of a PHP file grouped by namespace, or an empty
 * map when the file cannot be read.
 *
 * @return array<string, array<string, string>> namespace => (lowercased alias => fully qualified name)
 */
function fileImports(string $file): array
{
    $source = is_file($file) ? file_get_contents($file) : false;

    return is_string($source) ? \StorybookPhp\Runtime\Contract\parseFileImports($source) : [];
}

/**
 * Collects top-level `use` imports from PHP source, grouped by namespace.
 *
 * Statements are matched line by line: `namespace X;`, `namespace X {`, and
 * `use ...;` lines. Inside a brace-less namespace an indented `use` is a
 * trait import in a class body and is skipped; closure `use (...)` clauses
 * and `use function` / `use const` imports never name a type.
 *
 * @return array<string, array<string, string>> namespace => (lowercased alias => fully qualified name)
 *
 * @example Group and aliased imports
 *     $imports = \StorybookPhp\Runtime\Contract\parseFileImports("<?php\nnamespace App;\nuse Lib\\{A, B as C};\nuse Other\\D;\n");
 *     $imports['App'] // => ['a' => 'Lib\\A', 'c' => 'Lib\\B', 'd' => 'Other\\D']
 */
function parseFileImports(string $source): array
{
    $imports = ['' => []];
    $namespace = '';
    $braced = false;
    $pattern = '/^([ \t]*)(?:namespace[ \t]+([A-Za-z_\\\\][A-Za-z0-9_\\\\]*)[ \t]*([;{])|use[ \t]+((?!function[ \t]|const[ \t])[^;(]+);)/m';
    preg_match_all($pattern, $source, $matches, PREG_SET_ORDER | PREG_UNMATCHED_AS_NULL);
    foreach ($matches as $match) {
        if ($match[2] !== null) {
            $namespace = $match[2];
            $braced = $match[3] === '{';
            $imports[$namespace] ??= [];
            continue;
        }
        if ($match[1] !== '' && !$braced) {
            continue;
        }
        $imports[$namespace] = array_merge($imports[$namespace], \StorybookPhp\Runtime\Contract\parseUseClause($match[4] ?? ''));
    }

    return $imports;
}

/**
 * Parses the body of a `use` statement into alias => fully qualified name.
 *
 * Function and constant imports are ignored because they never name a type.
 *
 * @return array<string, string>
 */
function parseUseClause(string $clause): array
{
    if (preg_match('/^(function|const)\s/i', $clause) === 1) {
        return [];
    }
    $grouped = preg_match('/^(.*?)\\\\?\s*\{(.*)\}$/s', $clause, $match) === 1;
    $prefix = $grouped ? trim($match[1], '\\ ') . '\\' : '';
    $body = $grouped ? $match[2] : $clause;
    $imports = [];
    foreach (explode(',', $body) as $entry) {
        $entry = trim($entry);
        if ($entry === '' || preg_match('/^(function|const)\s/i', $entry) === 1) {
            continue;
        }
        $aliased = preg_match('/^(.*?)\s+as\s+(\S+)$/i', $entry, $parts) === 1;
        $name = ltrim($prefix . trim($aliased ? $parts[1] : $entry), '\\');
        $alias = $aliased ? $parts[2] : substr($name, (int) strrpos('\\' . $name, '\\'));
        $imports[strtolower($alias)] = $name;
    }

    return $imports;
}

/**
 * Resolves a written type name into the fully qualified name it denotes in
 * the scope, following PHP's rules for `self`, `static`, `parent`, imports,
 * and the current namespace. Builtin names are returned canonicalised.
 *
 * The returned class name is not guaranteed to exist: callers decide how to
 * report an unknown class.
 *
 * @example Resolving through an import alias
 *     $scope = new \StorybookPhp\Runtime\Contract\TypeScope('App\Views', ['item' => 'App\Models\Item']);
 *     \StorybookPhp\Runtime\Contract\resolveTypeName('Item', $scope) // => 'App\Models\Item'
 *     \StorybookPhp\Runtime\Contract\resolveTypeName('Card', $scope) // => 'App\Views\Card'
 *     \StorybookPhp\Runtime\Contract\resolveTypeName('\DateTimeImmutable', $scope) // => 'DateTimeImmutable'
 */
function resolveTypeName(string $name, TypeScope $scope): string
{
    $lower = strtolower($name);
    if (in_array($lower, ['self', 'static', '$this'], true)) {
        return $scope->className ?? $name;
    }
    if ($lower === 'parent') {
        return $scope->parentClass ?? $name;
    }
    $builtin = \StorybookPhp\Runtime\Contract\canonicalBuiltinTypeName($name);
    if ($builtin !== null) {
        return $builtin;
    }
    if (str_starts_with($name, '\\')) {
        return ltrim($name, '\\');
    }
    $segments = explode('\\', $name);
    $alias = strtolower($segments[0]);
    if (isset($scope->imports[$alias])) {
        $segments[0] = $scope->imports[$alias];

        return implode('\\', $segments);
    }
    $namespaced = $scope->namespace === '' ? $name : $scope->namespace . '\\' . $name;
    if (\StorybookPhp\Runtime\Contract\typeExists($namespaced) || !\StorybookPhp\Runtime\Contract\typeExists($name)) {
        return $namespaced;
    }

    return $name;
}

/**
 * Resolves every name in a parsed docblock type against a scope, substituting
 * known template arguments and turning unresolved templates into `mixed`.
 *
 * @param array<string, TypeNode> $templates template name => bound type
 *
 * @example Resolving a documented list element type
 *     $scope = new \StorybookPhp\Runtime\Contract\TypeScope('App', ['item' => 'App\Models\Item']);
 *     $node = \StorybookPhp\Runtime\Contract\parseTypeExpression('list<Item>');
 *     \StorybookPhp\Runtime\Contract\describeTypeNode(\StorybookPhp\Runtime\Contract\resolveTypeNode($node, $scope)) // => 'list<App\Models\Item>'
 */
function resolveTypeNode(TypeNode $node, TypeScope $scope, array $templates = []): TypeNode
{
    return \StorybookPhp\Runtime\Contract\mapTypeNodeNames(
        $node,
        static function (string $name) use ($scope, $templates): TypeNode|string {
            if (isset($templates[$name])) {
                return $templates[$name];
            }
            if (in_array($name, $scope->templates, true)) {
                return new TypeNode('named', 'mixed');
            }

            return \StorybookPhp\Runtime\Contract\resolveTypeName($name, $scope);
        },
    );
}
