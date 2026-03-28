<?php /** @var string $title */ /** @var string $author */ /** @var string $body */ /** @var string $date */ /** @var array $tags */ ?>
<article class="blog-post" style="max-width: 640px; font-family: system-ui;">
    <header style="margin-bottom: 16px;">
        <h1 style="margin: 0 0 8px 0; font-size: 28px; line-height: 1.3;"><?= htmlspecialchars($title ?? 'Untitled Post') ?></h1>
        <div style="display: flex; align-items: center; gap: 12px; color: #6b7280; font-size: 14px;">
            <span>By <strong><?= htmlspecialchars($author ?? 'Anonymous') ?></strong></span>
            <span>&middot;</span>
            <time><?= htmlspecialchars($date ?? date('F j, Y')) ?></time>
        </div>
    </header>

    <?php if (!empty($tags ?? [])): ?>
    <div class="blog-tags" style="display: flex; gap: 6px; margin-bottom: 16px;">
        <?php foreach ($tags as $tag): ?>
        <span style="display: inline-block; padding: 2px 10px; border-radius: 12px; background: #f3f4f6; color: #374151; font-size: 12px;"><?= htmlspecialchars($tag) ?></span>
        <?php endforeach; ?>
    </div>
    <?php endif; ?>

    <div class="blog-body" style="line-height: 1.7; color: #374151;">
        <p><?= nl2br(htmlspecialchars($body ?? '')) ?></p>
    </div>

    <footer style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
        <div style="display: flex; gap: 16px; font-size: 13px; color: #9ca3af;">
            <span>&#9829; Like</span>
            <span>&#128172; Comment</span>
            <span>&#128279; Share</span>
        </div>
    </footer>
</article>
