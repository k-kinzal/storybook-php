<?php

declare(strict_types=1);

namespace StorybookPhp\Runtime\Contract;

use RuntimeException;
use Throwable;

/**
 * Reports why a Storybook value could not be converted into the PHP value a
 * parameter or property expects.
 *
 * The message always names the slot that failed, for example
 * `App\Card::__construct($items)[0] > App\Item::$label`, followed by the
 * reason, so a story author can see which argument, key, or property to fix.
 */
final class HydrationException extends RuntimeException
{
    /**
     * @param string $path slot path such as `App\Card::__construct($items)[0]`, or empty for a top-level value
     * @param string $reason explanation of what was expected and what was received
     *
     * @example Composing the message from path and reason
     *     $error = new \StorybookPhp\Runtime\Contract\HydrationException('App\Card::$title', 'expected string, received array');
     *     $error->getMessage() // => 'Cannot hydrate App\Card::$title: expected string, received array'
     */
    public function __construct(public string $path, public string $reason, ?Throwable $previous = null)
    {
        parent::__construct(($path === '' ? 'Cannot hydrate value: ' : "Cannot hydrate {$path}: ") . $reason, 0, $previous);
    }
}
