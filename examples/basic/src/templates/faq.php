<?php /** @var array $items */ /** @var string $title */ /** @var bool $numbered */ ?>
<div class="faq" style="max-width: 640px;">
    <h2 style="margin: 0 0 16px 0;"><?= htmlspecialchars($title ?? 'FAQ') ?></h2>
    <?php $items = $items ?? []; ?>
    <?php if (empty($items)): ?>
        <p style="color: #6b7280;">No questions yet.</p>
    <?php else: ?>
        <?php foreach ($items as $i => $item): ?>
            <?php
                $q = is_array($item) ? ($item['question'] ?? '') : (string) $item;
                $a = is_array($item) ? ($item['answer'] ?? '') : '';
                $num = !empty($numbered) ? ($i + 1) . '. ' : '';
            ?>
            <details style="margin-bottom: 8px; border: 1px solid #e5e7eb; border-radius: 6px;">
                <summary style="padding: 12px 16px; cursor: pointer; font-weight: 600;"><?= htmlspecialchars($num . $q) ?></summary>
                <div style="padding: 0 16px 12px; color: #4b5563;"><?= htmlspecialchars($a) ?></div>
            </details>
        <?php endforeach; ?>
    <?php endif; ?>
</div>
