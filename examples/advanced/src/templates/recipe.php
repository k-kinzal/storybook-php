<?php
/**
 * Template demonstrating complex rendering with arrays, conditionals, and loops.
 * Variables: $title, $servings, $ingredients (array), $steps (array), $notes (nullable string)
 */
$title = $title ?? 'Untitled Recipe';
$servings = $servings ?? 4;
$ingredients = $ingredients ?? [];
$steps = $steps ?? [];
$notes = $notes ?? null;
?>
<div class="recipe" style="font-family: system-ui; max-width: 480px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
    <div style="background: #fef3c7; padding: 16px 20px;">
        <h2 style="margin: 0; color: #92400e;"><?= htmlspecialchars($title) ?></h2>
        <span style="font-size: 13px; color: #b45309;">Serves <?= (int)$servings ?></span>
    </div>

    <?php if (!empty($ingredients)): ?>
    <div style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6;">
        <h3 style="margin: 0 0 8px; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Ingredients</h3>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
            <?php foreach ($ingredients as $item): ?>
            <li><?= htmlspecialchars(is_array($item) ? ($item['name'] ?? '') : (string)$item) ?></li>
            <?php endforeach; ?>
        </ul>
    </div>
    <?php endif; ?>

    <?php if (!empty($steps)): ?>
    <div style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6;">
        <h3 style="margin: 0 0 8px; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Instructions</h3>
        <ol style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
            <?php foreach ($steps as $step): ?>
            <li style="margin-bottom: 4px;"><?= htmlspecialchars((string)$step) ?></li>
            <?php endforeach; ?>
        </ol>
    </div>
    <?php endif; ?>

    <?php if ($notes !== null): ?>
    <div style="padding: 12px 20px; background: #f9fafb; font-size: 13px; color: #6b7280;">
        <strong>Note:</strong> <?= htmlspecialchars($notes) ?>
    </div>
    <?php endif; ?>
</div>
