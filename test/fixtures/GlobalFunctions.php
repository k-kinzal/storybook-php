<?php

function truncate(string $text, int $length = 50, string $suffix = '...'): string
{
    return "truncated";
}

function highlight(string $text, string $term, string $color = '#fef08a'): string
{
    return "highlighted";
}

function slugify(string $text, string $separator = '-'): string
{
    return "slugified";
}
