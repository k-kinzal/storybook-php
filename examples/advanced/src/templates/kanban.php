<?php
/**
 * Kanban board template with nested arrays (columns containing cards).
 * Demonstrates nested iteration and conditional rendering.
 */
$columns = $columns ?? [
    ['title' => 'To Do', 'cards' => ['Design header', 'Write tests']],
    ['title' => 'In Progress', 'cards' => ['Build parser']],
    ['title' => 'Done', 'cards' => ['Setup project', 'Add CI']],
];
$boardTitle = $boardTitle ?? 'Project Board';
$showCounts = $showCounts ?? true;
$compact = $compact ?? false;

$padding = $compact ? '8px' : '16px';
$gap = $compact ? '8px' : '16px';
?>
<div class="kanban-board" style="font-family: system-ui, sans-serif;">
    <h2 style="margin: 0 0 16px;"><?= htmlspecialchars($boardTitle) ?></h2>
    <div style="display: flex; gap: <?= $gap ?>;">
        <?php foreach ($columns as $col): ?>
            <div class="kanban-column" style="flex: 1; background: #f3f4f6; border-radius: 8px; padding: <?= $padding ?>;">
                <h3 style="margin: 0 0 12px; font-size: 14px; color: #374151;">
                    <?= htmlspecialchars($col['title']) ?>
                    <?php if ($showCounts): ?>
                        <span style="color: #9ca3af; font-weight: normal;">(<?= count($col['cards']) ?>)</span>
                    <?php endif; ?>
                </h3>
                <?php foreach ($col['cards'] as $card): ?>
                    <div class="kanban-card" style="background: white; padding: 8px 12px; border-radius: 6px; margin-bottom: 8px; font-size: 13px; border: 1px solid #e5e7eb;">
                        <?= htmlspecialchars($card) ?>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endforeach; ?>
    </div>
</div>
