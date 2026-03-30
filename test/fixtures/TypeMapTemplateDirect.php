<?php

echo '<section data-featured="' . ($featured ? 'yes' : 'no') . '">';
echo "<h1>{$title}</h1>";
echo '<p class="tone tone-' . $tone->value . '">' . $tone->label() . '</p>';
echo $content->toHtml();
foreach ($items->items() as $item) {
    echo $item->toHtml();
}
$vars = get_defined_vars();
if (array_key_exists('note', $vars)) {
    echo $note === null ? '<em>note:null</em>' : "<em>note:{$note}</em>";
}
echo "<small>{$footer}</small>";
echo '</section>';
