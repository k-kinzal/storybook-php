<?php /** @var array $plans */ /** @var string $currency */ /** @var string $period */ /** @var string $highlighted */ ?>
<div class="pricing-grid" style="display: grid; grid-template-columns: repeat(<?= count($plans ?? []) ?>, 1fr); gap: 24px; max-width: 900px;">
<?php foreach (($plans ?? []) as $plan): ?>
    <?php
        $name = $plan['name'] ?? 'Plan';
        $price = $plan['price'] ?? 0;
        $features = $plan['features'] ?? [];
        $isHighlighted = ($name === ($highlighted ?? ''));
        $border = $isHighlighted ? '2px solid #3b82f6' : '1px solid #e5e7eb';
        $badge = $isHighlighted ? '<span class="pricing-badge" style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px;">Popular</span>' : '';
        $formattedPrice = match ($currency ?? 'USD') {
            'EUR' => "€" . number_format($price, 2),
            'GBP' => "£" . number_format($price, 2),
            'JPY' => "¥" . number_format($price, 0),
            default => "$" . number_format($price, 2),
        };
    ?>
    <div class="pricing-plan<?= $isHighlighted ? ' pricing-highlighted' : '' ?>" style="border: <?= $border ?>; border-radius: 12px; padding: 24px; text-align: center;">
        <h3 class="pricing-name"><?= htmlspecialchars($name) ?> <?= $badge ?></h3>
        <div class="pricing-price" style="font-size: 32px; font-weight: bold; margin: 16px 0;"><?= $formattedPrice ?><span style="font-size: 14px; color: #6b7280;">/ <?= htmlspecialchars($period ?? 'month') ?></span></div>
        <ul class="pricing-features" style="list-style: none; padding: 0; text-align: left;">
        <?php foreach ($features as $feature): ?>
            <li style="padding: 4px 0;">&#10003; <?= htmlspecialchars($feature) ?></li>
        <?php endforeach; ?>
        </ul>
    </div>
<?php endforeach; ?>
<?php if (empty($plans ?? [])): ?>
    <div class="pricing-empty">No plans available</div>
<?php endif; ?>
</div>
