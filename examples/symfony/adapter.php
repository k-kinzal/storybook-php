<?php

return function (mixed $result, string $buffered, ?object $instance): string {
    // Twig components return rendered HTML strings directly from render()
    if (is_string($result) && $result !== '') {
        return $result;
    }

    return resolveOutput($result, $buffered);
};
