<?php /** @var string $title */ /** @var string $subtitle */ /** @var string $ctaLabel */ /** @var string $ctaUrl */ /** @var string $theme */ ?>
<section class="hero hero-<?= htmlspecialchars($theme ?? 'light') ?>" style="padding: 48px 24px; text-align: center; border-radius: 12px; <?php if (($theme ?? 'light') === 'dark'): ?>background-color: #1f2937; color: white;<?php elseif (($theme ?? 'light') === 'gradient'): ?>background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;<?php else: ?>background-color: #f3f4f6; color: #111827;<?php endif; ?>">
    <h1 style="margin: 0 0 8px 0; font-size: 2.5rem;"><?= htmlspecialchars($title ?? 'Welcome') ?></h1>
    <?php if (!empty($subtitle)): ?>
        <p style="margin: 0 0 24px 0; font-size: 1.25rem; opacity: 0.8;"><?= htmlspecialchars($subtitle) ?></p>
    <?php endif; ?>
    <?php if (!empty($ctaLabel)): ?>
        <a href="<?= htmlspecialchars($ctaUrl ?? '#') ?>" class="hero-cta" style="display: inline-block; padding: 12px 32px; border-radius: 8px; background-color: <?= ($theme ?? 'light') === 'light' ? '#3b82f6' : '#ffffff' ?>; color: <?= ($theme ?? 'light') === 'light' ? 'white' : '#1f2937' ?>; text-decoration: none; font-weight: bold;"><?= htmlspecialchars($ctaLabel) ?></a>
    <?php endif; ?>
</section>
