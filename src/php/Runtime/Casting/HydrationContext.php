<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime\Casting;

use StorybookPhp\Runtime\Contract\TypeNode;

/**
 * Carries the configuration and position of one hydration pass.
 *
 * `bindings` are the normalised `typeMap.bindings`, `path` names the slot
 * currently being filled (used verbatim in error messages), `templates`
 * holds the generic arguments bound while descending into a generic class,
 * and `classes` is the raw `typeMap.classes` map of per-class argument
 * definitions.
 */
final class HydrationContext
{
    /**
     * @param array{types: array<string, string>, slots: array<string, array{type: string|null, value: mixed, hasValue: bool}>} $bindings
     * @param array<string, TypeNode> $templates template name => bound type for the class being hydrated
     * @param array<array-key, mixed> $classes `typeMap.classes` entries keyed by class name
     */
    public function __construct(
        public array $bindings,
        public string $path = '',
        public array $templates = [],
        public array $classes = [],
    ) {
    }

    /**
     * Creates a context from the raw `typeMap` object of a runner request.
     *
     * @param array<string, mixed>|null $typeMap
     *
     * @example Building a context with an interface binding
     *     $ctx = \StorybookPhp\Runtime\Casting\HydrationContext::fromTypeMap(['bindings' => ['App\Renderable' => 'App\HtmlBlock']]);
     *     $ctx->bindings['types'] // => ['app\renderable' => 'App\HtmlBlock']
     *     $ctx->path // => ''
     */
    public static function fromTypeMap(?array $typeMap): self
    {
        $classes = $typeMap['classes'] ?? null;

        return new self(\StorybookPhp\Runtime\Contract\normalizeTypeMapBindings($typeMap), '', [], is_array($classes) ? $classes : []);
    }

    /**
     * Returns the raw `typeMap` shape that class-level lookups expect.
     *
     * @return array{classes: array<array-key, mixed>}
     *
     * @example Round-tripping class entries
     *     $ctx = \StorybookPhp\Runtime\Casting\HydrationContext::fromTypeMap(['classes' => ['App\Tree' => ['args' => ['branches' => 'Branch[]']]]]);
     *     $ctx->classTypeMap() // => ['classes' => ['App\Tree' => ['args' => ['branches' => 'Branch[]']]]]
     */
    public function classTypeMap(): array
    {
        return ['classes' => $this->classes];
    }

    /**
     * Returns a context positioned at a named slot such as `App\Card::$title`.
     *
     * @example Nesting slot labels
     *     $ctx = new \StorybookPhp\Runtime\Casting\HydrationContext(['types' => [], 'slots' => []]);
     *     $ctx->at('App\Card::__construct($items)')->key(0)->at('App\Item::$label')->path // => 'App\Card::__construct($items)[0] > App\Item::$label'
     */
    public function at(string $label): self
    {
        return new self($this->bindings, $this->path === '' ? $label : "{$this->path} > {$label}", $this->templates, $this->classes);
    }

    /**
     * Returns a context positioned at an array key below the current slot.
     *
     * @example Array key labels
     *     $ctx = new \StorybookPhp\Runtime\Casting\HydrationContext(['types' => [], 'slots' => []], 'App\Card::$meta');
     *     $ctx->key('theme')->path // => 'App\Card::$meta[theme]'
     */
    public function key(string|int $key): self
    {
        return new self($this->bindings, "{$this->path}[{$key}]", $this->templates, $this->classes);
    }

    /**
     * Returns a context whose template names are bound to concrete types.
     *
     * @param array<string, TypeNode> $templates
     *
     * @example Binding a generic argument
     *     $ctx = new \StorybookPhp\Runtime\Casting\HydrationContext(['types' => [], 'slots' => []]);
     *     $bound = $ctx->withTemplates(['T' => new \StorybookPhp\Runtime\Contract\TypeNode('named', 'App\Item')]);
     *     $bound->templates['T']->name // => 'App\Item'
     */
    public function withTemplates(array $templates): self
    {
        return new self($this->bindings, $this->path, $templates, $this->classes);
    }
}
