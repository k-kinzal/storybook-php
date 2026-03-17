<?php /** @var array $steps */ /** @var int $current */ /** @var string $orientation */ ?>
<?php
    $current = $current ?? 0;
    $orientation = $orientation ?? 'horizontal';
    $steps = $steps ?? [];
    $isVertical = $orientation === 'vertical';
    $containerStyle = $isVertical
        ? 'display: flex; flex-direction: column; gap: 0;'
        : 'display: flex; align-items: flex-start; gap: 0;';
?>
<div class="steps" style="font-family: system-ui; <?= $containerStyle ?>">
    <?php foreach ($steps as $i => $step):
        $label = htmlspecialchars($step['label'] ?? 'Step ' . ($i + 1));
        $desc = $step['description'] ?? '';
        $isDone = $i < $current;
        $isActive = $i === $current;

        if ($isDone) {
            $circleBg = '#22c55e';
            $circleContent = '✓';
        } elseif ($isActive) {
            $circleBg = '#3b82f6';
            $circleContent = (string)($i + 1);
        } else {
            $circleBg = '#d1d5db';
            $circleContent = (string)($i + 1);
        }

        $textColor = $isActive ? '#111827' : '#6b7280';
        $fontWeight = $isActive ? 'bold' : 'normal';
    ?>
        <div style="display: flex; <?= $isVertical ? 'flex-direction: row; align-items: flex-start; gap: 12px;' : 'flex-direction: column; align-items: center; flex: 1; text-align: center;' ?>">
            <div style="display: flex; <?= $isVertical ? 'flex-direction: column;' : 'flex-direction: row;' ?> align-items: center; <?= $isVertical ? '' : 'width: 100%;' ?>">
                <div style="width: 32px; height: 32px; border-radius: 50%; background: <?= $circleBg ?>; color: white; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; flex-shrink: 0;">
                    <?= $circleContent ?>
                </div>
                <?php if ($i < count($steps) - 1): ?>
                    <?php if ($isVertical): ?>
                        <div style="width: 2px; height: 24px; background: <?= $isDone ? '#22c55e' : '#d1d5db' ?>; margin: 4px auto;"></div>
                    <?php else: ?>
                        <div style="flex: 1; height: 2px; background: <?= $isDone ? '#22c55e' : '#d1d5db' ?>; margin: 0 8px;"></div>
                    <?php endif; ?>
                <?php endif; ?>
            </div>
            <div style="<?= $isVertical ? '' : 'margin-top: 8px;' ?>">
                <div style="font-size: 13px; font-weight: <?= $fontWeight ?>; color: <?= $textColor ?>;"><?= $label ?></div>
                <?php if (!empty($desc)): ?>
                    <div style="font-size: 11px; color: #9ca3af; margin-top: 2px;"><?= htmlspecialchars($desc) ?></div>
                <?php endif; ?>
            </div>
        </div>
    <?php endforeach; ?>
</div>
