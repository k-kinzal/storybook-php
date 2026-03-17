<?php /** @var string $title */ /** @var string $message */ /** @var string $type */ /** @var string $time */ /** @var bool $unread */ ?>
<?php
$title = $title ?? 'Notification';
$message = $message ?? '';
$type = $type ?? 'info';
$time = $time ?? 'just now';
$unread = $unread ?? true;

$icons = ['info' => 'ℹ', 'success' => '✓', 'warning' => '⚠', 'error' => '✕'];
$colors = ['info' => '#3b82f6', 'success' => '#10b981', 'warning' => '#f59e0b', 'error' => '#ef4444'];
$icon = $icons[$type] ?? $icons['info'];
$color = $colors[$type] ?? $colors['info'];
?>
<div class="notification-item" style="display: flex; gap: 12px; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: system-ui; <?= $unread ? 'background: #f0f9ff;' : 'background: white;' ?>">
    <div style="width: 36px; height: 36px; border-radius: 50%; background: <?= $color ?>20; color: <?= $color ?>; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0;"><?= $icon ?></div>
    <div style="flex: 1; min-width: 0;">
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <strong style="font-size: 14px;"><?= htmlspecialchars($title) ?></strong>
            <span style="font-size: 12px; color: #9ca3af; white-space: nowrap;"><?= htmlspecialchars($time) ?></span>
        </div>
        <?php if ($message !== ''): ?>
        <p style="margin: 4px 0 0; font-size: 13px; color: #6b7280; line-height: 1.4;"><?= htmlspecialchars($message) ?></p>
        <?php endif; ?>
    </div>
    <?php if ($unread): ?>
    <div style="width: 8px; height: 8px; border-radius: 50%; background: <?= $color ?>; flex-shrink: 0; margin-top: 6px;"></div>
    <?php endif; ?>
</div>
