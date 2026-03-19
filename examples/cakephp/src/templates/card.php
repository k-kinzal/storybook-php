<div class="card<?= $featured ? ' card-featured' : '' ?>">
  <?php if ($image): ?>
    <img src="<?= htmlspecialchars($image) ?>" alt="<?= htmlspecialchars($title) ?>" class="card-image">
  <?php endif; ?>
  <div class="card-body">
    <h3 class="card-title"><?= htmlspecialchars($title) ?></h3>
    <p class="card-text"><?= htmlspecialchars($body) ?></p>
  </div>
  <?php if ($footer): ?>
    <div class="card-footer"><?= htmlspecialchars($footer) ?></div>
  <?php endif; ?>
</div>
