<?php /** @var string $title */ /** @var string $body */ /** @var string $variant */ ?>
<div class="card card-<?= htmlspecialchars($variant ?? 'default') ?>" style="border: 1px solid #ddd; border-radius: 8px; padding: 16px; max-width: 300px;">
    <h2 style="margin-top: 0;"><?= htmlspecialchars($title ?? 'Untitled') ?></h2>
    <p><?= htmlspecialchars($body ?? '') ?></p>
</div>
