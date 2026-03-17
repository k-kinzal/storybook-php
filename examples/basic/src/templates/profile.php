<?php /** @var string $name */ /** @var string $role */ /** @var string $avatar */ ?>
<div class="profile-card" style="display: flex; align-items: center; gap: 16px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px; max-width: 400px;">
    <div class="profile-avatar" style="width: 64px; height: 64px; border-radius: 50%; background-color: #6366f1; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold;">
        <?= htmlspecialchars(mb_substr($name ?? 'U', 0, 1)) ?>
    </div>
    <div>
        <h3 style="margin: 0 0 4px 0;"><?= htmlspecialchars($name ?? 'Unknown') ?></h3>
        <p style="margin: 0; color: #6b7280;"><?= htmlspecialchars($role ?? 'Member') ?></p>
    </div>
</div>
