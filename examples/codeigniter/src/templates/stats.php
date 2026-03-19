<div class="stats-grid">
  <?php foreach ($items as $item): ?>
    <div class="stat-card" style="border-top: 3px solid <?= htmlspecialchars($color) ?>">
      <div class="stat-value"><?= htmlspecialchars((string) $item['value']) ?></div>
      <div class="stat-label"><?= htmlspecialchars($item['label']) ?></div>
    </div>
  <?php endforeach; ?>
</div>
