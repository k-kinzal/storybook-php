<?php /** @var string $title */ /** @var int $eventCount */ /** @var string $theme */ ?>
<div class="timeline" style="font-family: system-ui; max-width: 500px; <?php if (($theme ?? 'light') === 'dark'): ?>background: #1f2937; color: #f3f4f6; padding: 20px; border-radius: 12px;<?php endif; ?>">
    <h3 style="margin: 0 0 16px 0;"><?= htmlspecialchars($title ?? 'Activity Timeline') ?></h3>
    <div style="position: relative; padding-left: 24px;">
        <div style="position: absolute; left: 7px; top: 0; bottom: 0; width: 2px; background: <?= ($theme ?? 'light') === 'dark' ? '#4b5563' : '#e5e7eb' ?>;"></div>
        <?php
        $count = max(1, min((int) ($eventCount ?? 4), 10));
        $events = [
            ['label' => 'Project created', 'time' => '2 hours ago', 'color' => '#3b82f6'],
            ['label' => 'Component added', 'time' => '1 hour ago', 'color' => '#10b981'],
            ['label' => 'Tests passed', 'time' => '45 min ago', 'color' => '#22c55e'],
            ['label' => 'Review requested', 'time' => '30 min ago', 'color' => '#f59e0b'],
            ['label' => 'Approved', 'time' => '15 min ago', 'color' => '#8b5cf6'],
            ['label' => 'Deployed to staging', 'time' => '10 min ago', 'color' => '#06b6d4'],
            ['label' => 'QA verified', 'time' => '5 min ago', 'color' => '#22c55e'],
            ['label' => 'Deployed to production', 'time' => '2 min ago', 'color' => '#3b82f6'],
            ['label' => 'Monitoring active', 'time' => '1 min ago', 'color' => '#10b981'],
            ['label' => 'Complete', 'time' => 'Just now', 'color' => '#6b7280'],
        ];
        for ($i = 0; $i < $count; $i++):
            $event = $events[$i];
        ?>
            <div style="position: relative; padding-bottom: 16px;">
                <div style="position: absolute; left: -20px; top: 2px; width: 12px; height: 12px; border-radius: 50%; background: <?= $event['color'] ?>; border: 2px solid <?= ($theme ?? 'light') === 'dark' ? '#1f2937' : '#ffffff' ?>;"></div>
                <div>
                    <div style="font-weight: 500; font-size: 14px;"><?= htmlspecialchars($event['label']) ?></div>
                    <div style="font-size: 12px; color: <?= ($theme ?? 'light') === 'dark' ? '#9ca3af' : '#6b7280' ?>;"><?= htmlspecialchars($event['time']) ?></div>
                </div>
            </div>
        <?php endfor; ?>
    </div>
</div>
