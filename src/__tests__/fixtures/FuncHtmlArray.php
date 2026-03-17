<?php

function statusCard(string $title, string $status = 'active', int $count = 0): array {
    return [
        'html' => "<div class=\"status-card\"><span>{$title}</span><span>{$count}</span><span>{$status}</span></div>",
    ];
}
