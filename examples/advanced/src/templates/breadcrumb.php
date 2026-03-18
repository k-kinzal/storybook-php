<?php /** @var array $items */ /** @var string $separator */ ?>
<nav class="breadcrumb" style="font-family: system-ui; font-size: 14px;">
    <ol style="list-style: none; padding: 0; margin: 0; display: flex; align-items: center; gap: 4px;">
        <?php foreach (($items ?? []) as $i => $item): ?>
            <?php if ($i > 0): ?>
                <li style="color: #9ca3af;" aria-hidden="true"><?= htmlspecialchars($separator ?? '/') ?></li>
            <?php endif; ?>
            <?php if (isset($item['url']) && $i < count($items ?? []) - 1): ?>
                <li><a href="<?= htmlspecialchars($item['url']) ?>" style="color: #3b82f6; text-decoration: none;"><?= htmlspecialchars($item['label'] ?? '') ?></a></li>
            <?php else: ?>
                <li style="color: #374151; font-weight: 600;"><?= htmlspecialchars($item['label'] ?? (is_string($item) ? $item : '')) ?></li>
            <?php endif; ?>
        <?php endforeach; ?>
    </ol>
</nav>
