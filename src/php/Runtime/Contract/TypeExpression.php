<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime\Contract;

/**
 * Parses a PHPDoc type expression such as `array{foo: Foo, bar?: int}|null`
 * into a {@see TypeNode} tree.
 *
 * Supported syntax: builtin and class names, `?T`, unions, intersections,
 * parenthesised groups, generics (`list<T>`, `array<K, V>`, `Collection<T>`),
 * `T[]`, array and object shapes with optional keys and `...`, literal
 * strings and numbers, and callable signatures (`callable(int): string`).
 *
 * @throws HydrationException when the expression is malformed
 *
 * @example Parsing an array shape
 *     $node = \StorybookPhp\Runtime\Contract\parseTypeExpression('array{foo: Foo, bar?: int}');
 *     $node->kind // => 'shape'
 *     $node->fields['foo']->name // => 'Foo'
 *     $node->optionalKeys // => ['bar']
 */
function parseTypeExpression(string $expression): TypeNode
{
    $tokens = \StorybookPhp\Runtime\Contract\tokenizeTypeExpression($expression);
    if ($tokens === []) {
        throw new HydrationException('', 'the docblock type expression is empty.');
    }

    [$node, $position] = \StorybookPhp\Runtime\Contract\parseUnionType($tokens, 0, $expression);
    if (isset($tokens[$position])) {
        throw new HydrationException('', \StorybookPhp\Runtime\Contract\unexpectedTypeToken($tokens[$position], $expression));
    }

    return $node;
}

/**
 * Splits a type expression into identifier, number, string, and punctuation tokens.
 *
 * @return list<array{type: 'ident'|'number'|'string'|'punct', value: string, offset: int}>
 * @throws HydrationException when a character cannot start a token
 */
function tokenizeTypeExpression(string $expression): array
{
    $pattern = '/\s+|(?P<punct>\.\.\.|[<>,|&()?{}:\[\]=])|(?P<number>-?\d+(?:\.\d+)?)|(?P<string>\'(?:[^\'\\\\]|\\\\.)*\'|"(?:[^"\\\\]|\\\\.)*")|(?P<ident>[\\\\$A-Za-z_][A-Za-z0-9_\\\\\-]*(?:::[A-Za-z0-9_*]+)?)/A';
    $tokens = [];
    $offset = 0;
    $length = strlen($expression);

    while ($offset < $length) {
        if (preg_match($pattern, $expression, $match, 0, $offset) !== 1) {
            throw new HydrationException('', "unexpected character '{$expression[$offset]}' at offset {$offset} in type '{$expression}'.");
        }
        $offset += strlen($match[0]);
        foreach (['punct', 'number', 'string', 'ident'] as $type) {
            if (isset($match[$type]) && $match[$type] !== '') {
                $tokens[] = ['type' => $type, 'value' => $match[$type], 'offset' => $offset - strlen($match[0])];
                break;
            }
        }
    }

    return $tokens;
}

/**
 * @param array{type: 'ident'|'number'|'string'|'punct', value: string, offset: int} $token
 */
function unexpectedTypeToken(array $token, string $expression): string
{
    return "unexpected '{$token['value']}' at offset {$token['offset']} in type '{$expression}'.";
}

/**
 * @param list<array{type: 'ident'|'number'|'string'|'punct', value: string, offset: int}> $tokens
 * @param int $position +mut advanced past the tokens the parser consumes
 * @return array{TypeNode, int}
 * @throws HydrationException when the expression is malformed
 */
function parseUnionType(array $tokens, int $position, string $expression): array
{
    [$member, $position] = \StorybookPhp\Runtime\Contract\parseIntersectionType($tokens, $position, $expression);
    $members = [$member];
    while (\StorybookPhp\Runtime\Contract\typeTokenIs($tokens, $position, '|')) {
        [$member, $position] = \StorybookPhp\Runtime\Contract\parseIntersectionType($tokens, $position + 1, $expression);
        $members[] = $member;
    }

    return [count($members) === 1 ? $members[0] : new TypeNode('union', '', $members), $position];
}

/**
 * @param list<array{type: 'ident'|'number'|'string'|'punct', value: string, offset: int}> $tokens
 * @param int $position +mut advanced past the tokens the parser consumes
 * @return array{TypeNode, int}
 * @throws HydrationException when the expression is malformed
 */
function parseIntersectionType(array $tokens, int $position, string $expression): array
{
    [$member, $position] = \StorybookPhp\Runtime\Contract\parseNullableType($tokens, $position, $expression);
    $members = [$member];
    while (\StorybookPhp\Runtime\Contract\typeTokenIs($tokens, $position, '&')) {
        [$member, $position] = \StorybookPhp\Runtime\Contract\parseNullableType($tokens, $position + 1, $expression);
        $members[] = $member;
    }

    return [count($members) === 1 ? $members[0] : new TypeNode('intersection', '', $members), $position];
}

/**
 * @param list<array{type: 'ident'|'number'|'string'|'punct', value: string, offset: int}> $tokens
 * @param int $position +mut advanced past the tokens the parser consumes
 * @return array{TypeNode, int}
 * @throws HydrationException when the expression is malformed
 */
function parseNullableType(array $tokens, int $position, string $expression): array
{
    if (!\StorybookPhp\Runtime\Contract\typeTokenIs($tokens, $position, '?')) {
        return \StorybookPhp\Runtime\Contract\parsePostfixType($tokens, $position, $expression);
    }

    [$inner, $position] = \StorybookPhp\Runtime\Contract\parsePostfixType($tokens, $position + 1, $expression);

    return [new TypeNode('nullable', '', [$inner]), $position];
}

/**
 * @param list<array{type: 'ident'|'number'|'string'|'punct', value: string, offset: int}> $tokens
 * @param int $position +mut advanced past the tokens the parser consumes
 * @return array{TypeNode, int}
 * @throws HydrationException when the expression is malformed
 */
function parsePostfixType(array $tokens, int $position, string $expression): array
{
    [$node, $position] = \StorybookPhp\Runtime\Contract\parseAtomType($tokens, $position, $expression);
    while (
        \StorybookPhp\Runtime\Contract\typeTokenIs($tokens, $position, '[')
        && \StorybookPhp\Runtime\Contract\typeTokenIs($tokens, $position + 1, ']')
    ) {
        $node = new TypeNode('generic', 'array', [$node]);
        $position += 2;
    }

    return [$node, $position];
}

/**
 * @param list<array{type: 'ident'|'number'|'string'|'punct', value: string, offset: int}> $tokens
 * @param int $position +mut advanced past the tokens the parser consumes
 * @return array{TypeNode, int}
 * @throws HydrationException when the expression is malformed
 */
function parseAtomType(array $tokens, int $position, string $expression): array
{
    $token = $tokens[$position] ?? null;
    if ($token === null) {
        throw new HydrationException('', "unexpected end of type '{$expression}'.");
    }
    if ($token['type'] === 'punct' && $token['value'] === '(') {
        [$node, $position] = \StorybookPhp\Runtime\Contract\parseUnionType($tokens, $position + 1, $expression);

        return [$node, \StorybookPhp\Runtime\Contract\expectTypeToken($tokens, $position, ')', $expression)];
    }
    if ($token['type'] === 'number') {
        $literal = str_contains($token['value'], '.') ? (float) $token['value'] : (int) $token['value'];

        return [new TypeNode('literal', '', [], [], [], true, $literal), $position + 1];
    }
    if ($token['type'] === 'string') {
        return [new TypeNode('literal', '', [], [], [], true, stripcslashes(substr($token['value'], 1, -1))), $position + 1];
    }
    if ($token['type'] !== 'ident') {
        throw new HydrationException('', \StorybookPhp\Runtime\Contract\unexpectedTypeToken($token, $expression));
    }

    return \StorybookPhp\Runtime\Contract\parseNamedType($tokens, $position, $expression);
}

/**
 * Parses an identifier together with a callable signature, generic argument
 * list, or shape body that follows it.
 *
 * @param list<array{type: 'ident'|'number'|'string'|'punct', value: string, offset: int}> $tokens
 * @param int $position +mut advanced past the tokens the parser consumes
 * @return array{TypeNode, int}
 * @throws HydrationException when the expression is malformed
 */
function parseNamedType(array $tokens, int $position, string $expression): array
{
    $name = $tokens[$position]['value'];
    $position++;
    $lower = strtolower(ltrim($name, '\\'));
    if (in_array($lower, ['true', 'false'], true)) {
        return [new TypeNode('literal', '', [], [], [], true, $lower === 'true'), $position];
    }
    if (
        in_array($lower, ['callable', 'closure', 'pure-callable', 'pure-closure'], true)
        && \StorybookPhp\Runtime\Contract\typeTokenIs($tokens, $position, '(')
    ) {
        return \StorybookPhp\Runtime\Contract\parseCallableSignature($tokens, $position, $expression, $name);
    }
    if (\StorybookPhp\Runtime\Contract\typeTokenIs($tokens, $position, '<')) {
        [$arguments, $position] = \StorybookPhp\Runtime\Contract\parseTypeArguments($tokens, $position + 1, $expression);

        return [new TypeNode('generic', $name, $arguments), $position];
    }
    if (\StorybookPhp\Runtime\Contract\typeTokenIs($tokens, $position, '{')) {
        return \StorybookPhp\Runtime\Contract\parseShapeType($tokens, $position + 1, $expression, $name);
    }

    return [new TypeNode('named', $name), $position];
}

/**
 * Skips a callable parameter list and optional return type, keeping only the callable name.
 *
 * @param list<array{type: 'ident'|'number'|'string'|'punct', value: string, offset: int}> $tokens
 * @param int $position +mut advanced past the tokens the parser consumes
 * @return array{TypeNode, int}
 * @throws HydrationException when the signature is malformed
 */
function parseCallableSignature(array $tokens, int $position, string $expression, string $name): array
{
    $depth = 0;
    $count = count($tokens);
    for ($index = $position; $index < $count; $index++) {
        $token = $tokens[$index];
        if ($token['type'] !== 'punct') {
            continue;
        }
        $depth += $token['value'] === '(' ? 1 : ($token['value'] === ')' ? -1 : 0);
        if ($depth === 0) {
            $position = $index + 1;
            if (\StorybookPhp\Runtime\Contract\typeTokenIs($tokens, $position, ':')) {
                [, $position] = \StorybookPhp\Runtime\Contract\parseNullableType($tokens, $position + 1, $expression);
            }

            return [new TypeNode('named', $name), $position];
        }
    }

    throw new HydrationException('', "unclosed callable signature in type '{$expression}'.");
}

/**
 * @param list<array{type: 'ident'|'number'|'string'|'punct', value: string, offset: int}> $tokens
 * @param int $position +mut advanced past the tokens the parser consumes
 * @return array{list<TypeNode>, int}
 * @throws HydrationException when the argument list is malformed
 */
function parseTypeArguments(array $tokens, int $position, string $expression): array
{
    $arguments = [];
    while (true) {
        [$argument, $position] = \StorybookPhp\Runtime\Contract\parseUnionType($tokens, $position, $expression);
        $arguments[] = $argument;
        if (!\StorybookPhp\Runtime\Contract\typeTokenIs($tokens, $position, ',')) {
            return [$arguments, \StorybookPhp\Runtime\Contract\expectTypeToken($tokens, $position, '>', $expression)];
        }
        $position++;
    }
}

/**
 * Parses `{key: T, key?: T, ...}` shape fields after the opening brace.
 *
 * @param list<array{type: 'ident'|'number'|'string'|'punct', value: string, offset: int}> $tokens
 * @param int $position +mut advanced past the tokens the parser consumes
 * @return array{TypeNode, int}
 * @throws HydrationException when the shape body is malformed
 */
function parseShapeType(array $tokens, int $position, string $expression, string $name): array
{
    $fields = [];
    $optional = [];
    $sealed = true;
    while (!\StorybookPhp\Runtime\Contract\typeTokenIs($tokens, $position, '}')) {
        if (\StorybookPhp\Runtime\Contract\typeTokenIs($tokens, $position, '...')) {
            $sealed = false;
            $position++;
        } else {
            [$key, $isOptional, $position] = \StorybookPhp\Runtime\Contract\parseShapeKey($tokens, $position, count($fields));
            [$fields[$key], $position] = \StorybookPhp\Runtime\Contract\parseUnionType($tokens, $position, $expression);
            if ($isOptional) {
                $optional[] = $key;
            }
        }
        if (\StorybookPhp\Runtime\Contract\typeTokenIs($tokens, $position, ',')) {
            $position++;
            continue;
        }
        $position = \StorybookPhp\Runtime\Contract\expectTypeToken($tokens, $position, '}', $expression) - 1;
    }

    return [new TypeNode('shape', $name, [], $fields, $optional, $sealed), $position + 1];
}

/**
 * Reads an explicit `key:` or `key?:` prefix, or assigns the next positional index.
 *
 * @param list<array{type: 'ident'|'number'|'string'|'punct', value: string, offset: int}> $tokens
 * @return array{string, bool, int}
 */
function parseShapeKey(array $tokens, int $position, int $nextIndex): array
{
    $token = $tokens[$position] ?? null;
    if ($token === null || $token['type'] === 'punct') {
        return [(string) $nextIndex, false, $position];
    }
    $key = $token['type'] === 'string' ? substr($token['value'], 1, -1) : $token['value'];
    if (\StorybookPhp\Runtime\Contract\typeTokenIs($tokens, $position + 1, ':')) {
        return [$key, false, $position + 2];
    }
    if (
        \StorybookPhp\Runtime\Contract\typeTokenIs($tokens, $position + 1, '?')
        && \StorybookPhp\Runtime\Contract\typeTokenIs($tokens, $position + 2, ':')
    ) {
        return [$key, true, $position + 3];
    }

    return [(string) $nextIndex, false, $position];
}

/**
 * @param list<array{type: 'ident'|'number'|'string'|'punct', value: string, offset: int}> $tokens
 */
function typeTokenIs(array $tokens, int $position, string $punct): bool
{
    $token = $tokens[$position] ?? null;

    return $token !== null && $token['type'] === 'punct' && $token['value'] === $punct;
}

/**
 * @param list<array{type: 'ident'|'number'|'string'|'punct', value: string, offset: int}> $tokens
 * @return int the position after the expected token
 * @throws HydrationException when another token or the end of input is found
 */
function expectTypeToken(array $tokens, int $position, string $punct, string $expression): int
{
    if (\StorybookPhp\Runtime\Contract\typeTokenIs($tokens, $position, $punct)) {
        return $position + 1;
    }
    $token = $tokens[$position] ?? null;
    if ($token === null) {
        throw new HydrationException('', "expected '{$punct}' before the end of type '{$expression}'.");
    }

    throw new HydrationException('', "expected '{$punct}' but found '{$token['value']}' at offset {$token['offset']} in type '{$expression}'.");
}
