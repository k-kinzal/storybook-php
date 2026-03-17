<?php /** @var string $title */ /** @var array $metrics */ ?>
<div class="metrics-dashboard" style="font-family: system-ui;">
    <h2 style="margin: 0 0 16px; font-size: 18px; color: #111827;"><?= htmlspecialchars($title ?? 'Metrics') ?></h2>
    <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <?php foreach (($metrics ?? []) as $metric): ?>
            <?php
                $label = $metric['label'] ?? 'N/A';
                $value = $metric['value'] ?? '0';
                $trend = $metric['trend'] ?? '';
            ?>
            <?php include __DIR__ . '/partial/stat-card.php'; ?>
        <?php endforeach; ?>
    </div>
</div>
