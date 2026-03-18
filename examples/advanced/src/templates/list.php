<?php /** @var string $title */ /** @var array $items */ /** @var bool $numbered */ ?>
<div class="list-template" style="max-width: 400px;">
    <h3 style="margin-top: 0;"><?= htmlspecialchars($title ?? 'List') ?></h3>
    <?php if (!empty($items ?? [])): ?>
        <?php if (!empty($numbered)): ?>
            <ol style="padding-left: 20px;">
                <?php foreach ($items as $item): ?>
                    <li style="margin: 4px 0;"><?= htmlspecialchars($item) ?></li>
                <?php endforeach; ?>
            </ol>
        <?php else: ?>
            <ul style="padding-left: 20px;">
                <?php foreach ($items as $item): ?>
                    <li style="margin: 4px 0;"><?= htmlspecialchars($item) ?></li>
                <?php endforeach; ?>
            </ul>
        <?php endif; ?>
    <?php else: ?>
        <p class="empty" style="color: #9ca3af; font-style: italic;">No items to display.</p>
    <?php endif; ?>
</div>
