<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime\Casting;

use StorybookPhp\Runtime\Contract\TypeNode;

/**
 * Carries the configuration and position of one hydration pass.
 *
 * `bindings` are the normalised `types`, `path` names the slot
 * currently being filled (used verbatim in error messages), `templates`
 * holds the generic arguments bound while descending into a generic class.
 */
final class HydrationContext
{
    /**
     * @param array{types: array<string, string>, slots: array<string, array{type: string|null, value: mixed, hasValue: bool}>} $bindings
     * @param array<string, TypeNode> $templates template name => bound type for the class being hydrated
     */
    public function __construct(
        public array $bindings,
        public string $path = '',
        public array $templates = [],
    ) {
    }

    /**
     * Creates a context from the raw `types` object of a runner request.
     *
     * @param array<string, mixed>|null $types
     *
     * @example Building a context with an interface binding
     *     $ctx = \StorybookPhp\Runtime\Casting\HydrationContext::fromTypes(['App\Renderable' => 'App\HtmlBlock']);
     *     $ctx->bindings['types'] // => ['app\renderable' => 'App\HtmlBlock']
     *     $ctx->path // => ''
     */
    public static function fromTypes(?array $types): self
    {
        return new self(\StorybookPhp\Runtime\Contract\normalizeTypeMappings($types));
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
        return new self($this->bindings, $this->path === '' ? $label : "{$this->path} > {$label}", $this->templates);
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
        return new self($this->bindings, "{$this->path}[{$key}]", $this->templates);
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
        return new self($this->bindings, $this->path, $templates);
    }
}
