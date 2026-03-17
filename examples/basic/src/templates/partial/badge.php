<?php /** @var string $text */ /** @var string $color */ ?>
<span class="partial-badge" style="display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 12px; background: <?= htmlspecialchars($color ?? '#6b7280') ?>; color: white;"><?= htmlspecialchars($text ?? '') ?></span>
