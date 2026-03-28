<?php
$type = $type ?? 'info';
$message = $message ?? '';
$title = $title ?? null;
$dismissible = $dismissible ?? false;

$styles = [
    'info'    => ['bg' => '#eff6ff', 'border' => '#3b82f6', 'text' => '#1e40af'],
    'success' => ['bg' => '#f0fdf4', 'border' => '#22c55e', 'text' => '#166534'],
    'warning' => ['bg' => '#fffbeb', 'border' => '#f59e0b', 'text' => '#92400e'],
    'error'   => ['bg' => '#fef2f2', 'border' => '#ef4444', 'text' => '#991b1b'],
];
$s = $styles[$type] ?? $styles['info'];
?>
<div class="alert-template alert-<?= htmlspecialchars($type) ?>" role="alert" style="padding: 12px 16px; background: <?= $s['bg'] ?>; border-left: 4px solid <?= $s['border'] ?>; border-radius: 4px; color: <?= $s['text'] ?>; font-family: system-ui, sans-serif; font-size: 14px; position: relative;">
    <?php if ($dismissible): ?>
    <button style="position: absolute; top: 8px; right: 12px; background: none; border: none; cursor: pointer; font-size: 18px; color: <?= $s['text'] ?>; opacity: 0.5;">&times;</button>
    <?php endif; ?>
    <?php if ($title): ?>
    <strong style="display: block; margin-bottom: 4px;"><?= htmlspecialchars($title) ?></strong>
    <?php endif; ?>
    <span><?= htmlspecialchars($message) ?></span>
</div>
