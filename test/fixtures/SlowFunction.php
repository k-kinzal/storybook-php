<?php

declare(strict_types=1);

function waitForTimeout(): string
{
    sleep(60);

    return 'The render timeout was not enforced.';
}
