<?php
$tabs = $tabs ?? [];
$activeIndex = $activeIndex ?? 0;
$variant = $variant ?? 'default';
?>
<div class="tabs tabs-<?= htmlspecialchars($variant) ?>" style="font-family: system-ui, sans-serif;">
    <?php if (!empty($tabs)): ?>
    <div class="tabs-nav" role="tablist" style="display: flex; border-bottom: <?= $variant === 'pills' ? 'none' : '2px solid #e5e7eb' ?>; gap: <?= $variant === 'pills' ? '8px' : '0' ?>; margin-bottom: 16px;">
        <?php foreach ($tabs as $i => $tab): ?>
            <?php
            $isActive = $i === $activeIndex;
            $label = $tab['label'] ?? 'Tab ' . ($i + 1);
            if ($variant === 'pills') {
                $style = $isActive
                    ? 'background: #3b82f6; color: white; padding: 6px 16px; border-radius: 20px; border: none; cursor: pointer; font-size: 13px; font-weight: 500;'
                    : 'background: #f3f4f6; color: #6b7280; padding: 6px 16px; border-radius: 20px; border: none; cursor: pointer; font-size: 13px;';
            } else {
                $style = $isActive
                    ? 'padding: 8px 16px; border: none; border-bottom: 2px solid #3b82f6; margin-bottom: -2px; background: none; color: #3b82f6; cursor: pointer; font-size: 14px; font-weight: 500;'
                    : 'padding: 8px 16px; border: none; border-bottom: 2px solid transparent; margin-bottom: -2px; background: none; color: #6b7280; cursor: pointer; font-size: 14px;';
            }
            ?>
            <button role="tab" aria-selected="<?= $isActive ? 'true' : 'false' ?>" style="<?= $style ?>"><?= htmlspecialchars($label) ?></button>
        <?php endforeach; ?>
    </div>
    <?php if (isset($tabs[$activeIndex])): ?>
    <div class="tabs-content" role="tabpanel" style="padding: 8px 0; font-size: 14px; color: #374151;">
        <?= $tabs[$activeIndex]['content'] ?? '' ?>
    </div>
    <?php endif; ?>
    <?php else: ?>
    <p class="tabs-empty" style="color: #9ca3af; font-size: 14px;">No tabs defined</p>
    <?php endif; ?>
</div>
