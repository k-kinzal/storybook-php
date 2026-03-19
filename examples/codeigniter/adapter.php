<?php

return function (mixed $result, string $buffered, ?object $instance): string {
    // CI4 components return rendered HTML strings directly
    if (is_string($result) && $result !== '') {
        return $result;
    }

    return resolveOutput($result, $buffered);
};
