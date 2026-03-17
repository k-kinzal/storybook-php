<?php /** @var string $title */ /** @var string $body */ /** @var string $variant */ ?>
<div class="card card-<?= htmlspecialchars($variant ?? 'default') ?>">
    <h2><?= htmlspecialchars($title) ?></h2>
    <p><?= htmlspecialchars($body) ?></p>
</div>
