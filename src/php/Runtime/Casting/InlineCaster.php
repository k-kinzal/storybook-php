<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime\Casting;

use RuntimeException;
use StorybookPhp\Runtime\Contract\HydrationException;
use StorybookPhp\Runtime\Contract\TypeScope;

/**
 * Hydrates a value against a doc type written without an owning declaration,
 * such as the `type` of a template argument definition. Class names must be
 * fully qualified because there is no namespace to resolve them in.
 *
 * @param array<string, mixed>|null $types
 * @throws HydrationException when the value cannot satisfy the type
 *
 * @example Casting template input with a documented type
 *     \StorybookPhp\Runtime\Casting\castInlineDocTypeValue(['a' => '1'], 'array<string, int>') // => ['a' => 1]
 *     \StorybookPhp\Runtime\Casting\castInlineDocTypeValue(null, 'string') // => null
 */
function castInlineDocTypeValue(mixed $value, string $docType, ?array $types = null, string $label = ''): mixed
{
    $context = HydrationContext::fromTypes($types);
    $slot = $label === '' ? $context : $context->at($label);
    try {
        $node = \StorybookPhp\Runtime\Contract\parseTypeExpression($docType);
    } catch (HydrationException $exception) {
        throw new HydrationException($slot->path, "the type '{$docType}' cannot be parsed: {$exception->reason}", $exception);
    }

    return \StorybookPhp\Runtime\Casting\hydrateValue(
        $value,
        \StorybookPhp\Runtime\Contract\resolveTypeNode($node, new TypeScope()),
        $slot,
    );
}

/**
 * Casts one template argument using its generated definition.
 *
 * @param array<string, mixed> $argDef
 * @param array<string, mixed>|null $types
 * @throws HydrationException when the value cannot satisfy the definition
 *
 * @example Element types apply to every item
 *     \StorybookPhp\Runtime\Casting\castTemplateArgValue(['type' => 'array', 'elementType' => 'int'], ['1', '2']) // => [1, 2]
 *     \StorybookPhp\Runtime\Casting\castTemplateArgValue(['type' => 'unknown'], 'keep') // => 'keep'
 */
function castTemplateArgValue(array $argDef, mixed $value, ?array $types = null, string $label = ''): mixed
{
    $docType = \StorybookPhp\Runtime\Casting\argDefDocType($argDef);
    if ($docType === null || $value === null) {
        return $value;
    }

    return \StorybookPhp\Runtime\Casting\castInlineDocTypeValue($value, $docType, $types, $label);
}

/**
 * Cast template arguments using inline arg definitions emitted by the Vite plugin.
 *
 * @param array<string, mixed> $args
 * @param array<string, mixed> $argDefs
 * @param array<string, mixed>|null $types
 * @return array<string, mixed>
 * @throws HydrationException when a value cannot satisfy its definition
 * @throws RuntimeException when a required template argument is missing
 */
function castTemplateArgs(array $args, array $argDefs, ?array $types = null): array
{
    $casted = [];

    foreach ($argDefs as $name => $argDef) {
        if (!is_array($argDef)) {
            continue;
        }
        $argDef = \StorybookPhp\Runtime\Contract\normalizeStringKeyArray($argDef, "argDefs.{$name}");
        $label = 'template argument $' . $name;

        if (array_key_exists($name, $args)) {
            $casted[$name] = \StorybookPhp\Runtime\Casting\castTemplateArgValue($argDef, $args[$name], $types, $label);
            continue;
        }

        if (array_key_exists('default', $argDef)) {
            $casted[$name] = \StorybookPhp\Runtime\Casting\castTemplateArgValue($argDef, $argDef['default'], $types, $label);
            continue;
        }

        if (($argDef['nullable'] ?? false) === true) {
            $casted[$name] = null;
            continue;
        }

        if (($argDef['required'] ?? false) === true) {
            throw new RuntimeException("Missing required argument: {$name} (the template argument has no default; pass it in the story args).");
        }
    }

    return array_replace($args, $casted);
}
