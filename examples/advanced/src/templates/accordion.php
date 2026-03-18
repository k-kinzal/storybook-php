<?php /** @var array $items */ /** @var bool $multiple */ /** @var string $variant */ ?>
<div class="accordion" style="font-family: system-ui; max-width: 480px;">
    <?php if (empty($items ?? [])): ?>
        <p style="color: #9ca3af; font-style: italic;">No items to display.</p>
    <?php else: ?>
        <?php foreach ($items as $i => $item):
            $isOpen = !empty($item['open']);
            $title = htmlspecialchars($item['title'] ?? 'Untitled');
            $content = $item['content'] ?? '';
            $variant = $variant ?? 'default';
            $borderColor = $variant === 'bordered' ? '#3b82f6' : '#e5e7eb';
        ?>
            <details class="accordion-item" style="border: 1px solid <?= $borderColor ?>; border-radius: 8px; margin-bottom: 8px; overflow: hidden;"<?= $isOpen ? ' open' : '' ?>>
                <summary style="padding: 12px 16px; cursor: pointer; font-weight: 600; background: <?= $variant === 'bordered' ? '#eff6ff' : '#f9fafb' ?>; user-select: none; list-style: none; display: flex; justify-content: space-between; align-items: center;">
                    <?= $title ?>
                    <span style="font-size: 12px; color: #9ca3af;">▼</span>
                </summary>
                <div style="padding: 12px 16px; border-top: 1px solid <?= $borderColor ?>; font-size: 14px; line-height: 1.6; color: #4b5563;">
                    <?= $content ?>
                </div>
            </details>
        <?php endforeach; ?>
    <?php endif; ?>
</div>
