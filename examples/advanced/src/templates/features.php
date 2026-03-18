<?php /** @var string $heading */ /** @var array $features */ /** @var int $columns */ ?>
<section class="features" style="font-family: system-ui; padding: 32px 0;">
    <h2 style="text-align: center; margin: 0 0 24px 0; font-size: 1.75rem; color: #111827;"><?= htmlspecialchars($heading ?? 'Features') ?></h2>
    <div style="display: grid; grid-template-columns: repeat(<?= (int)($columns ?? 3) ?>, 1fr); gap: 20px;">
        <?php foreach (($features ?? []) as $feature): ?>
            <div style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; text-align: center;">
                <?php if (!empty($feature['icon'])): ?>
                    <div style="font-size: 2rem; margin-bottom: 8px;"><?= $feature['icon'] ?></div>
                <?php endif; ?>
                <h3 style="margin: 0 0 6px 0; font-size: 1.1rem; color: #111827;"><?= htmlspecialchars($feature['title'] ?? '') ?></h3>
                <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.5;"><?= htmlspecialchars($feature['description'] ?? '') ?></p>
            </div>
        <?php endforeach; ?>
    </div>
</section>
