<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime\Contract;

/**
 * One node of a parsed type expression.
 *
 * A node is produced by the docblock type parser or from PHP reflection and
 * describes the contract a value must satisfy before it is handed to PHP.
 * Nodes are immutable: every transformation builds a new tree.
 *
 * | kind           | fields used                                         |
 * |----------------|-----------------------------------------------------|
 * | `named`        | `name` (builtin or fully qualified class name)      |
 * | `literal`      | `literal` (`'draft'`, `1`, `true`)                  |
 * | `nullable`     | `members[0]` (the inner type)                       |
 * | `union`        | `members`                                           |
 * | `intersection` | `members`                                           |
 * | `generic`      | `name`, `members` (type arguments, `Foo[]` → array) |
 * | `shape`        | `name` (`array`, `list`, `object`), `fields`, `optionalKeys`, `sealed` |
 */
final class TypeNode
{
    /**
     * @param 'named'|'literal'|'nullable'|'union'|'intersection'|'generic'|'shape' $kind
     * @param list<TypeNode> $members union or intersection members, generic arguments, or the nullable inner type
     * @param array<string, TypeNode> $fields shape fields keyed by name or by position
     * @param list<string> $optionalKeys shape keys that may be absent from the value
     */
    public function __construct(
        public string $kind,
        public string $name = '',
        public array $members = [],
        public array $fields = [],
        public array $optionalKeys = [],
        public bool $sealed = true,
        public string|int|float|bool|null $literal = null,
    ) {
    }
}
