<?php /** @var string $title */ /** @var array $items */ /** @var string $activeItem */ /** @var string $theme */ ?>
<aside class="sidebar sidebar-<?= htmlspecialchars($theme ?? 'light') ?>" style="width: 240px; padding: 16px; border-radius: 8px; font-family: system-ui; <?php if (($theme ?? 'light') === 'dark'): ?>background: #1f2937; color: #f3f4f6;<?php else: ?>background: #f9fafb; color: #111827; border: 1px solid #e5e7eb;<?php endif; ?>">
    <h3 style="margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; <?= ($theme ?? 'light') === 'dark' ? 'color: #9ca3af;' : 'color: #6b7280;' ?>"><?= htmlspecialchars($title ?? 'Navigation') ?></h3>
    <nav>
        <ul style="list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px;">
            <?php foreach (($items ?? ['Home', 'About', 'Contact']) as $item): ?>
                <?php $isActive = ($activeItem ?? '') === $item; ?>
                <li>
                    <a href="#" style="display: block; padding: 8px 12px; border-radius: 6px; text-decoration: none; font-size: 14px; <?php if ($isActive): ?>background: <?= ($theme ?? 'light') === 'dark' ? '#374151' : '#e5e7eb' ?>; font-weight: 600; color: <?= ($theme ?? 'light') === 'dark' ? '#ffffff' : '#111827' ?>;<?php else: ?>color: <?= ($theme ?? 'light') === 'dark' ? '#d1d5db' : '#4b5563' ?>;<?php endif; ?>"><?= htmlspecialchars($item) ?></a>
                </li>
            <?php endforeach; ?>
        </ul>
    </nav>
</aside>
