<div class="view-cell stats-cell">
  <h4 class="cell-title">Dashboard — <?= htmlspecialchars(ucfirst($period)) ?></h4>
  <div class="stats-grid">
    <?php foreach ($items as $item): ?>
      <div class="stat-card">
        <div class="stat-value"><?= htmlspecialchars((string) $item['value']) ?></div>
        <div class="stat-label"><?= htmlspecialchars($item['label']) ?></div>
        <div class="stat-trend stat-trend-<?= htmlspecialchars($item['trend']) ?>">
          <?= $item['trend'] === 'up' ? '&#9650;' : ($item['trend'] === 'down' ? '&#9660;' : '&#9679;') ?>
        </div>
      </div>
    <?php endforeach; ?>
  </div>
</div>
