<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class runtime_boundaryTest extends TestCase
{
    public function testDefersOutputResolutionForAdapterMiddleware(): void
    {
        $resolved = false;
        $result = (static function () use (&$resolved): Generator {
            $resolved = true;
            yield '';
        })();

        self::assertSame('buffered', \StorybookPhp\Runtime\resolveExecutionHtml($result, 'buffered', true));
        self::assertFalse($resolved);
    }

    public function testKeepsMaterializedCoreOutputForAdapterMiddleware(): void
    {
        self::assertSame('rendered', \StorybookPhp\Runtime\resolveExecutionHtml('rendered', '', true));
    }

    public function testProgrammingErrorsSurfaceWithoutAnAdapter(): void
    {
        $result = (static function (): Generator {
            yield from [];
            throw new TypeError('broken render implementation');
        })();

        $this->expectException(TypeError::class);
        \StorybookPhp\Runtime\resolveExecutionHtml($result, 'buffered', false);
    }

    public function testConvertsRequestFailuresToTheJsonProtocol(): void
    {
        $response = json_decode(
            \StorybookPhp\Runtime\failure(new RuntimeException('Invalid JSON request payload.')),
            true,
            512,
            JSON_THROW_ON_ERROR,
        );

        self::assertSame('', $response['html']);
        self::assertSame('Invalid JSON request payload.', $response['error']);
    }
}
