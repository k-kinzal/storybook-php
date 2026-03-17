<?php /** @var string $heading */ /** @var string $badgeText */ /** @var string $badgeColor */ /** @var string $content */ ?>
<div class="nested-template" style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; max-width: 400px;">
    <div class="nested-header" style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
        <h3 style="margin: 0;"><?= htmlspecialchars($heading ?? 'Untitled') ?></h3>
        <?php
        $text = $badgeText ?? '';
        $color = $badgeColor ?? '#6b7280';
        if ($text !== '') {
            include __DIR__ . '/partial/badge.php';
        }
        ?>
    </div>
    <div class="nested-body" style="color: #4b5563; font-size: 14px;">
        <?= htmlspecialchars($content ?? '') ?>
    </div>
</div>
