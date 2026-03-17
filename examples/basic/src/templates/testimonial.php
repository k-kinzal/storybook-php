<?php /** @var string $quote */ /** @var string $author */ /** @var string $role */ /** @var int $rating */ /** @var string $variant */ ?>
<?php
$quote = $quote ?? 'Great product!';
$author = $author ?? 'Anonymous';
$role = $role ?? '';
$rating = $rating ?? 5;
$variant = $variant ?? 'card';
$stars = str_repeat('★', min(max($rating, 0), 5)) . str_repeat('☆', 5 - min(max($rating, 0), 5));
?>
<?php if ($variant === 'minimal'): ?>
<blockquote style="margin: 0; padding: 0 0 0 16px; border-left: 3px solid #3b82f6; font-family: system-ui;">
    <p style="margin: 0 0 8px; font-style: italic; color: #374151;">&ldquo;<?= htmlspecialchars($quote) ?>&rdquo;</p>
    <footer style="font-size: 14px; color: #6b7280;">&mdash; <?= htmlspecialchars($author) ?></footer>
</blockquote>
<?php else: ?>
<div class="testimonial" style="padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; font-family: system-ui; max-width: 400px; background: #fafafa;">
    <div style="color: #f59e0b; font-size: 18px; margin-bottom: 8px;"><?= $stars ?></div>
    <p style="margin: 0 0 16px; font-style: italic; color: #374151; line-height: 1.6;">&ldquo;<?= htmlspecialchars($quote) ?>&rdquo;</p>
    <div style="display: flex; align-items: center; gap: 10px;">
        <div style="width: 40px; height: 40px; border-radius: 50%; background: #3b82f6; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;"><?= strtoupper(mb_substr($author, 0, 1)) ?></div>
        <div>
            <div style="font-weight: 600; font-size: 14px;"><?= htmlspecialchars($author) ?></div>
            <?php if ($role !== ''): ?>
            <div style="font-size: 13px; color: #6b7280;"><?= htmlspecialchars($role) ?></div>
            <?php endif; ?>
        </div>
    </div>
</div>
<?php endif; ?>
