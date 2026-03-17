<?php
namespace App\Helpers;

function echoGreet(string $name, string $style = 'banner'): void {
    echo "<div class=\"echo-greet echo-greet-{$style}\">";
    echo "Hello, <strong>{$name}</strong>!";
    echo "</div>";
}
