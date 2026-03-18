<?php /** @var string $query */ /** @var int $resultCount */ /** @var string $category */ ?>
<div class="search-results" style="font-family: system-ui; max-width: 600px;">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
        <div style="flex: 1; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; background: white; font-size: 14px; color: #374151;">
            <?= htmlspecialchars($query ?? '') ?: '<span style="color: #9ca3af;">Search...</span>' ?>
        </div>
        <button style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer;">Search</button>
    </div>
    <?php if (!empty($category)): ?>
        <div style="margin-bottom: 12px;">
            <span style="display: inline-block; padding: 4px 12px; border-radius: 12px; background: #eff6ff; color: #3b82f6; font-size: 12px;">
                <?= htmlspecialchars($category) ?>
            </span>
        </div>
    <?php endif; ?>
    <?php
    $count = (int) ($resultCount ?? 3);
    if ($count > 0):
    ?>
        <p style="color: #6b7280; font-size: 13px; margin: 0 0 12px;"><?= $count ?> results found</p>
        <?php for ($i = 1; $i <= $count; $i++): ?>
            <div style="padding: 12px; border-bottom: 1px solid #f3f4f6;">
                <a href="#" style="color: #3b82f6; text-decoration: none; font-weight: 500;">Result <?= $i ?> for "<?= htmlspecialchars($query ?? 'query') ?>"</a>
                <p style="margin: 4px 0 0; color: #6b7280; font-size: 13px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
        <?php endfor; ?>
    <?php else: ?>
        <div style="text-align: center; padding: 32px 0; color: #9ca3af;">
            <p style="font-size: 16px; margin: 0;">No results found</p>
            <p style="font-size: 13px; margin: 4px 0 0;">Try a different search term.</p>
        </div>
    <?php endif; ?>
</div>
