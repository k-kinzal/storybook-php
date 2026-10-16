<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime\Contract;

/**
 * Type names whose values are PHP arrays, with or without generic arguments.
 */
const ARRAY_LIKE_TYPE_NAMES = ['array', 'list', 'iterable', 'non-empty-list', 'non-empty-array'];

/**
 * Renders a node back into PHPDoc syntax for error messages.
 *
 * @example Describing a nullable list
 *     $node = \StorybookPhp\Runtime\Contract\parseTypeExpression('?list<App\Item>');
 *     \StorybookPhp\Runtime\Contract\describeTypeNode($node) // => '?list<App\Item>'
 */
function describeTypeNode(TypeNode $node): string
{
    $describe = static fn (TypeNode $member): string => \StorybookPhp\Runtime\Contract\describeTypeNode($member);

    return match ($node->kind) {
        'named' => $node->name,
        'literal' => is_string($node->literal) ? "'" . $node->literal . "'" : var_export($node->literal, true),
        'nullable' => '?' . $describe($node->members[0]),
        'union' => implode('|', array_map($describe, $node->members)),
        'intersection' => implode('&', array_map($describe, $node->members)),
        'generic' => $node->name . '<' . implode(', ', array_map($describe, $node->members)) . '>',
        'shape' => \StorybookPhp\Runtime\Contract\describeShapeNode($node),
    };
}

/**
 * Renders the field list of a shape node.
 */
function describeShapeNode(TypeNode $node): string
{
    $fields = [];
    foreach ($node->fields as $key => $field) {
        $marker = in_array($key, $node->optionalKeys, true) ? '?' : '';
        $fields[] = $key . $marker . ': ' . \StorybookPhp\Runtime\Contract\describeTypeNode($field);
    }
    if (!$node->sealed) {
        $fields[] = '...';
    }

    return $node->name . '{' . implode(', ', $fields) . '}';
}

/**
 * Rebuilds a tree, replacing every `named` and `generic` node name through the callback.
 *
 * The callback may return a replacement node (used for template substitution)
 * or a string with the resolved name.
 *
 * @param callable(string): (TypeNode|string) $rename
 */
function mapTypeNodeNames(TypeNode $node, callable $rename): TypeNode
{
    $map = static fn (TypeNode $member): TypeNode => \StorybookPhp\Runtime\Contract\mapTypeNodeNames($member, $rename);
    if ($node->kind === 'named') {
        $renamed = $rename($node->name);

        return is_string($renamed) ? new TypeNode('named', $renamed) : $renamed;
    }
    if ($node->kind === 'generic') {
        $renamed = $rename($node->name);
        $name = is_string($renamed) ? $renamed : $renamed->name;

        return new TypeNode('generic', $name, array_map($map, $node->members));
    }
    if ($node->kind === 'shape') {
        return new TypeNode('shape', $node->name, [], array_map($map, $node->fields), $node->optionalKeys, $node->sealed);
    }

    return new TypeNode($node->kind, $node->name, array_map($map, $node->members), [], [], $node->sealed, $node->literal);
}

/**
 * Reports whether a type accepts `null`.
 *
 * @example Nullable detection
 *     \StorybookPhp\Runtime\Contract\typeNodeAcceptsNull(\StorybookPhp\Runtime\Contract\parseTypeExpression('string|null')) // => true
 *     \StorybookPhp\Runtime\Contract\typeNodeAcceptsNull(\StorybookPhp\Runtime\Contract\parseTypeExpression('string')) // => false
 */
function typeNodeAcceptsNull(TypeNode $node): bool
{
    if ($node->kind === 'nullable') {
        return true;
    }
    if ($node->kind === 'named') {
        return in_array(strtolower($node->name), ['null', 'mixed'], true);
    }
    if ($node->kind === 'union') {
        foreach ($node->members as $member) {
            if (\StorybookPhp\Runtime\Contract\typeNodeAcceptsNull($member)) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Removes `null` from a type so the remaining contract can be refined.
 */
function stripNullFromTypeNode(TypeNode $node): TypeNode
{
    if ($node->kind === 'nullable') {
        return $node->members[0];
    }
    if ($node->kind !== 'union') {
        return $node;
    }
    $members = array_values(array_filter(
        $node->members,
        static fn (TypeNode $member): bool => $member->kind !== 'named' || strtolower($member->name) !== 'null',
    ));
    if (count($members) === count($node->members)) {
        return $node;
    }

    return count($members) === 1 ? $members[0] : new TypeNode('union', '', $members);
}

/**
 * Collects the members of a union, or the node itself for any other kind.
 *
 * @return list<TypeNode>
 */
function typeNodeMembers(TypeNode $node): array
{
    return $node->kind === 'union' ? $node->members : [$node];
}

/**
 * Builds a union from members, collapsing a single member.
 *
 * @param list<TypeNode> $members
 */
function unionTypeNode(array $members): TypeNode
{
    return count($members) === 1 ? $members[0] : new TypeNode('union', '', $members);
}

/**
 * Maps builtin aliases and PHPStan pseudo-types to the canonical builtin name,
 * or returns null when the name denotes a class, interface, enum, or template.
 *
 * @example Canonical builtin names
 *     \StorybookPhp\Runtime\Contract\canonicalBuiltinTypeName('integer') // => 'int'
 *     \StorybookPhp\Runtime\Contract\canonicalBuiltinTypeName('non-empty-string') // => 'string'
 *     \StorybookPhp\Runtime\Contract\canonicalBuiltinTypeName('App\Item') // => null
 */
function canonicalBuiltinTypeName(string $name): ?string
{
    $lower = strtolower(ltrim($name, '\\'));
    $canonical = [
        'string', 'int', 'float', 'bool', 'array', 'iterable', 'object', 'callable', 'mixed', 'null',
        'void', 'never', 'resource', 'scalar', 'numeric', 'self', 'static', 'parent', 'list',
        'non-empty-list', 'non-empty-array', 'true', 'false',
    ];
    if (in_array($lower, $canonical, true)) {
        return $lower;
    }
    $aliases = [
        'integer' => 'int', 'double' => 'float', 'boolean' => 'bool', 'number' => 'float', 'unknown' => 'mixed',
        '$this' => 'static', 'closure' => 'callable', 'pure-callable' => 'callable', 'pure-closure' => 'callable',
        'noreturn' => 'never', 'no-return' => 'never', 'empty' => 'mixed', 'key-of' => 'mixed', 'value-of' => 'mixed',
        'array-key' => 'mixed',
    ];
    if (isset($aliases[$lower])) {
        return $aliases[$lower];
    }
    if (str_ends_with($lower, '-string') || $lower === 'class-string' || $lower === 'interface-string') {
        return 'string';
    }
    if (str_ends_with($lower, '-int') || str_starts_with($lower, 'int-mask')) {
        return 'int';
    }

    return str_contains($lower, '-') ? 'mixed' : null;
}

/**
 * Reports whether a builtin name denotes a native PHP array (or iterable) value.
 *
 * @example Array-like names
 *     \StorybookPhp\Runtime\Contract\isArrayLikeTypeName('non-empty-list') // => true
 *     \StorybookPhp\Runtime\Contract\isArrayLikeTypeName('App\Collection') // => false
 */
function isArrayLikeTypeName(string $name): bool
{
    return in_array(strtolower(ltrim($name, '\\')), ARRAY_LIKE_TYPE_NAMES, true);
}
