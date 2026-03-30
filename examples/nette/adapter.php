<?php

return [
    'render' => function (mixed $result, string $buffered, ?object $instance): string {
        if (is_string($result) && $result !== '') {
            return $result;
        }

        return resolveOutput($result, $buffered);
    },
];
