<?php /** @var string $label */ /** @var string $value */ /** @var string $trend */ ?>
<div class="stat-card" style="padding: 16px; background: white; border: 1px solid #e5e7eb; border-radius: 8px; min-width: 140px;">
    <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;"><?= htmlspecialchars($label ?? 'Metric') ?></div>
    <div style="font-size: 24px; font-weight: 700; color: #111827; margin-top: 4px;"><?= htmlspecialchars($value ?? '0') ?></div>
    <?php if (!empty($trend)): ?>
        <div style="font-size: 12px; margin-top: 4px; color: <?= str_starts_with($trend, '+') ? '#16a34a' : '#dc2626' ?>;"><?= htmlspecialchars($trend) ?></div>
    <?php endif; ?>
</div>
