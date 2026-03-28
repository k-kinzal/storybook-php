<?php /** @var string $action */ /** @var string $method */ /** @var array $fields */ /** @var string $submitLabel */ ?>
<form class="form" action="<?= htmlspecialchars($action ?? '#') ?>" method="<?= htmlspecialchars($method ?? 'POST') ?>" style="max-width: 400px; display: flex; flex-direction: column; gap: 12px;">
    <?php foreach ($fields ?? [] as $field): ?>
        <div class="form-group" style="display: flex; flex-direction: column; gap: 4px;">
            <label style="font-weight: 600; font-size: 14px;"><?= htmlspecialchars($field['label'] ?? '') ?></label>
            <?php if (($field['type'] ?? 'text') === 'textarea'): ?>
                <textarea name="<?= htmlspecialchars($field['name'] ?? '') ?>" placeholder="<?= htmlspecialchars($field['placeholder'] ?? '') ?>" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; min-height: 80px;"></textarea>
            <?php else: ?>
                <input type="<?= htmlspecialchars($field['type'] ?? 'text') ?>" name="<?= htmlspecialchars($field['name'] ?? '') ?>" placeholder="<?= htmlspecialchars($field['placeholder'] ?? '') ?>" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
            <?php endif; ?>
        </div>
    <?php endforeach; ?>
    <button type="submit" style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;"><?= htmlspecialchars($submitLabel ?? 'Submit') ?></button>
</form>
