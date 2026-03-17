<?php /** @var array $entries */ /** @var string $version */ /** @var bool $compact */ ?>
<div class="changelog" style="max-width: 560px; font-family: system-ui;">
    <h2 style="margin: 0 0 16px 0; font-size: 20px;">
        Changelog
        <?php if (!empty($version)): ?>
            <span style="font-weight: normal; color: #6b7280; font-size: 14px;">v<?= htmlspecialchars($version) ?></span>
        <?php endif; ?>
    </h2>
    <?php $entries = $entries ?? []; ?>
    <?php if (empty($entries)): ?>
        <p style="color: #9ca3af;">No changelog entries.</p>
    <?php else: ?>
        <?php foreach ($entries as $entry): ?>
            <?php
                $type = $entry['type'] ?? 'change';
                $desc = htmlspecialchars($entry['description'] ?? '');
                $colors = [
                    'added' => ['bg' => '#dcfce7', 'text' => '#166534', 'label' => 'Added'],
                    'fixed' => ['bg' => '#dbeafe', 'text' => '#1e40af', 'label' => 'Fixed'],
                    'changed' => ['bg' => '#fef3c7', 'text' => '#92400e', 'label' => 'Changed'],
                    'removed' => ['bg' => '#fef2f2', 'text' => '#991b1b', 'label' => 'Removed'],
                ];
                $c = $colors[$type] ?? ['bg' => '#f3f4f6', 'text' => '#374151', 'label' => ucfirst($type)];
            ?>
            <div class="changelog-entry" style="display: flex; align-items: baseline; gap: 8px; padding: <?= !empty($compact) ? '4px 0' : '8px 0' ?>; <?php if (empty($compact)): ?>border-bottom: 1px solid #f3f4f6;<?php endif; ?>">
                <span style="display: inline-block; padding: 1px 8px; border-radius: 4px; background: <?= $c['bg'] ?>; color: <?= $c['text'] ?>; font-size: 11px; font-weight: 600; white-space: nowrap;"><?= $c['label'] ?></span>
                <span style="font-size: 14px; color: #374151;"><?= $desc ?></span>
            </div>
        <?php endforeach; ?>
    <?php endif; ?>
</div>
