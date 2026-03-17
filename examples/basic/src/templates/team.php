<?php
/**
 * Team grid template with complex PHP expressions.
 * Demonstrates match expressions, array_map, conditional rendering,
 * and computed styles inside a template context.
 */
$title = $title ?? 'Our Team';
$members = $members ?? [
    ['name' => 'Alice', 'role' => 'Engineer', 'status' => 'active'],
    ['name' => 'Bob', 'role' => 'Designer', 'status' => 'active'],
    ['name' => 'Charlie', 'role' => 'PM', 'status' => 'away'],
    ['name' => 'Diana', 'role' => 'Engineer', 'status' => 'offline'],
];
$columns = $columns ?? 2;
$showStatus = $showStatus ?? true;
$variant = $variant ?? 'card';
?>
<div class="team-grid" style="font-family: system-ui, sans-serif; max-width: 600px;">
    <h2 style="margin: 0 0 16px; font-size: 20px; color: #111827;"><?= htmlspecialchars($title) ?></h2>
    <div style="display: grid; grid-template-columns: repeat(<?= (int)$columns ?>, 1fr); gap: 12px;">
        <?php foreach ($members as $m):
            $initials = implode('', array_map(fn($w) => strtoupper($w[0] ?? ''), explode(' ', $m['name'])));
            $statusColor = match ($m['status'] ?? 'offline') {
                'active'  => '#22c55e',
                'away'    => '#f59e0b',
                'offline' => '#d1d5db',
                default   => '#d1d5db',
            };
            $roleBg = match ($m['role'] ?? '') {
                'Engineer' => '#dbeafe',
                'Designer' => '#fce7f3',
                'PM'       => '#fef3c7',
                default    => '#f3f4f6',
            };
        ?>
            <?php if ($variant === 'card'): ?>
                <div class="team-member" style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 10px; text-align: center;">
                    <div style="width: 48px; height: 48px; border-radius: 50%; background: #3b82f6; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px; margin: 0 auto 8px;"><?= $initials ?></div>
                    <div style="font-weight: 600; font-size: 15px;"><?= htmlspecialchars($m['name']) ?></div>
                    <span style="display: inline-block; margin-top: 4px; padding: 2px 8px; background: <?= $roleBg ?>; border-radius: 4px; font-size: 12px;"><?= htmlspecialchars($m['role']) ?></span>
                    <?php if ($showStatus): ?>
                        <div style="margin-top: 8px; font-size: 12px; color: #6b7280;">
                            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: <?= $statusColor ?>; margin-right: 4px;"></span>
                            <?= htmlspecialchars($m['status'] ?? 'offline') ?>
                        </div>
                    <?php endif; ?>
                </div>
            <?php else: ?>
                <div class="team-member-row" style="display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-bottom: 1px solid #f3f4f6;">
                    <div style="width: 32px; height: 32px; border-radius: 50%; background: #3b82f6; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; flex-shrink: 0;"><?= $initials ?></div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; font-size: 14px;"><?= htmlspecialchars($m['name']) ?></div>
                        <div style="font-size: 12px; color: #6b7280;"><?= htmlspecialchars($m['role']) ?></div>
                    </div>
                    <?php if ($showStatus): ?>
                        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: <?= $statusColor ?>;"></span>
                    <?php endif; ?>
                </div>
            <?php endif; ?>
        <?php endforeach; ?>
    </div>
</div>
