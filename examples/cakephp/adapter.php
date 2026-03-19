<?php

return function (mixed $result, string $buffered, ?object $instance): string {
    // CakePHP components return rendered HTML strings directly
    if (is_string($result) && $result !== '') {
        return $result;
    }

    return resolveOutput($result, $buffered);
};
