<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/**
 * @covers \StorybookPhp\Runtime\Transport\normalizeAdapterResponse
 */
final class runtime_adaptersTest extends TestCase
{
    public function testResponseMetadataMustHonorItsDeclaredContract(): void
    {
        $cases = [
            [['html' => 'ok', 'publicArgs' => 'invalid'], "Adapter response field 'publicArgs' must be an object."],
            [['html' => 'ok', 'buffered' => null], "Adapter response field 'buffered' must be a string."],
            [['html' => 'ok', 'instance' => 42], "Adapter response field 'instance' must be an object or null."],
        ];

        foreach ($cases as [$response, $message]) {
            try {
                \StorybookPhp\Runtime\Transport\normalizeAdapterResponse($response);
                self::fail('Expected invalid adapter metadata to fail.');
            } catch (RuntimeException $exception) {
                self::assertSame($message, $exception->getMessage());
            }
        }
    }
}
