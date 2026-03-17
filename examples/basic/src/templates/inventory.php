<?php /** @var array $products */ /** @var string $currency */ /** @var bool $showStock */ ?>
<div class="inventory" style="border: 1px solid #d1d5db; border-radius: 8px; overflow: hidden;">
    <table style="width: 100%; border-collapse: collapse; font-family: system-ui; font-size: 14px;">
        <thead>
            <tr style="background: #f3f4f6;">
                <th style="padding: 8px 12px; text-align: left;">Product</th>
                <th style="padding: 8px 12px; text-align: right;">Price</th>
                <?php if ($showStock ?? false): ?>
                    <th style="padding: 8px 12px; text-align: right;">Stock</th>
                <?php endif; ?>
            </tr>
        </thead>
        <tbody>
            <?php foreach (($products ?? []) as $product): ?>
                <?php
                    $name = htmlspecialchars($product['name'] ?? 'Unknown');
                    $price = number_format((float)($product['price'] ?? 0), 2);
                    $stock = (int)($product['stock'] ?? 0);
                    $symbol = ($currency ?? 'USD') === 'EUR' ? "\u{20AC}" : '$';
                    $stockColor = $stock > 10 ? '#10b981' : ($stock > 0 ? '#f59e0b' : '#ef4444');
                ?>
                <tr style="border-top: 1px solid #e5e7eb;">
                    <td style="padding: 8px 12px;"><?= $name ?></td>
                    <td style="padding: 8px 12px; text-align: right;"><?= $symbol ?><?= $price ?></td>
                    <?php if ($showStock ?? false): ?>
                        <td style="padding: 8px 12px; text-align: right; color: <?= $stockColor ?>;"><?= $stock ?></td>
                    <?php endif; ?>
                </tr>
            <?php endforeach; ?>
            <?php if (empty($products ?? [])): ?>
                <tr><td colspan="3" style="padding: 16px; text-align: center; color: #9ca3af;">No products</td></tr>
            <?php endif; ?>
        </tbody>
    </table>
</div>
