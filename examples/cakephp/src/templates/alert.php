<div class="alert alert-<?= htmlspecialchars($type) ?><?= $dismissible ? ' alert-dismissible' : '' ?>" role="alert">
  <strong><?= htmlspecialchars($title) ?></strong>
  <?php if ($message): ?>
    <p><?= htmlspecialchars($message) ?></p>
  <?php endif; ?>
  <?php if ($dismissible): ?>
    <button type="button" class="close" aria-label="Close">&times;</button>
  <?php endif; ?>
</div>
