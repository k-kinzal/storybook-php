<?php /** @var array $images */ /** @var int $columns */ /** @var string $gap */ ?>
<div class="gallery" style="display: grid; grid-template-columns: repeat(<?= (int)($columns ?? 3) ?>, 1fr); gap: <?= htmlspecialchars($gap ?? '12px') ?>;">
    <?php if (empty($images ?? [])): ?>
    <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #9ca3af; border: 2px dashed #e5e7eb; border-radius: 8px;">No images to display</div>
    <?php else: ?>
        <?php foreach ($images as $img): ?>
        <div class="gallery-item" style="aspect-ratio: 1; border-radius: 8px; overflow: hidden; background: #f3f4f6; display: flex; align-items: center; justify-content: center; border: 1px solid #e5e7eb;">
            <?php if (is_array($img)): ?>
                <div style="text-align: center; padding: 12px;">
                    <div style="font-size: 32px; margin-bottom: 4px;"><?= htmlspecialchars($img['emoji'] ?? '🖼️') ?></div>
                    <div style="font-size: 12px; color: #6b7280;"><?= htmlspecialchars($img['caption'] ?? '') ?></div>
                </div>
            <?php else: ?>
                <div style="font-size: 14px; color: #6b7280; padding: 12px;"><?= htmlspecialchars((string)$img) ?></div>
            <?php endif; ?>
        </div>
        <?php endforeach; ?>
    <?php endif; ?>
</div>
