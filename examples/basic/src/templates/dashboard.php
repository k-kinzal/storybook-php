<?php
$title = $title ?? 'Dashboard';
$stats = $stats ?? [];
$showChart = $showChart ?? false;
?>
<div class="dashboard">
    <h1 class="dashboard-title"><?= htmlspecialchars($title) ?></h1>
    <?php if (!empty($stats)): ?>
    <div class="dashboard-stats">
        <?php foreach ($stats as $stat): ?>
        <div class="stat-card">
            <span class="stat-label"><?= htmlspecialchars($stat['label'] ?? '') ?></span>
            <span class="stat-value"><?= htmlspecialchars((string) ($stat['value'] ?? '0')) ?></span>
            <?php if (isset($stat['change'])): ?>
            <span class="stat-change <?= $stat['change'] >= 0 ? 'positive' : 'negative' ?>"><?= $stat['change'] >= 0 ? '+' : '' ?><?= $stat['change'] ?>%</span>
            <?php endif; ?>
        </div>
        <?php endforeach; ?>
    </div>
    <?php else: ?>
    <p class="dashboard-empty">No stats available</p>
    <?php endif; ?>
    <?php if ($showChart): ?>
    <div class="dashboard-chart">Chart placeholder</div>
    <?php endif; ?>
</div>
