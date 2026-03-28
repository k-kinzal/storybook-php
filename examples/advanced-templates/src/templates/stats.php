<?php /** @var array $items */ /** @var int $columns */ /** @var string $variant */ ?>
<div class="stats-grid stats-<?= htmlspecialchars($variant ?? 'default') ?>" style="display: grid; grid-template-columns: repeat(<?= (int)($columns ?? 3) ?>, 1fr); gap: 16px;">
<?php if (!empty($items)): ?>
    <?php foreach ($items as $index => $item): ?>
        <div class="stat-card" style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; text-align: center; <?php if (($variant ?? 'default') === 'colored'): ?>background-color: <?= ['#eff6ff', '#f0fdf4', '#fef3c7', '#fef2f2'][$index % 4] ?>;<?php endif; ?>">
            <?php if (!empty($item['icon'])): ?>
                <div class="stat-icon" style="font-size: 24px; margin-bottom: 8px;"><?= $item['icon'] ?></div>
            <?php endif; ?>
            <div class="stat-value" style="font-size: 24px; font-weight: bold;"><?= htmlspecialchars($item['value'] ?? '0') ?></div>
            <div class="stat-label" style="color: #6b7280; font-size: 14px;"><?= htmlspecialchars($item['label'] ?? '') ?></div>
        </div>
    <?php endforeach; ?>
<?php else: ?>
    <div class="stats-empty" style="grid-column: 1 / -1; text-align: center; color: #9ca3af;">No stats available</div>
<?php endif; ?>
</div>
