<?php /** @var string $title */ /** @var string $body */ /** @var string $size */ /** @var bool $showClose */ /** @var bool $showFooter */ /** @var string $confirmLabel */ /** @var string $cancelLabel */ ?>
<div class="modal-backdrop" style="background: rgba(0,0,0,0.5); padding: 24px; display: flex; align-items: center; justify-content: center; min-height: 200px; border-radius: 8px;">
    <?php
        $maxWidth = match ($size ?? 'medium') {
            'small' => '320px',
            'large' => '640px',
            default => '480px',
        };
    ?>
    <div class="modal-dialog" style="background: white; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); max-width: <?= $maxWidth ?>; width: 100%; font-family: system-ui;">
        <div class="modal-header" style="padding: 16px 20px; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between;">
            <h3 style="margin: 0; font-size: 16px; color: #111827;"><?= htmlspecialchars($title ?? 'Dialog') ?></h3>
            <?php if ($showClose ?? true): ?>
                <button style="background: none; border: none; font-size: 20px; color: #9ca3af; cursor: pointer; padding: 0; line-height: 1;">&times;</button>
            <?php endif; ?>
        </div>
        <div class="modal-body" style="padding: 20px; color: #374151; font-size: 14px; line-height: 1.6;">
            <?= $body ?? 'Modal content goes here.' ?>
        </div>
        <?php if ($showFooter ?? true): ?>
            <div class="modal-footer" style="padding: 12px 20px; border-top: 1px solid #e5e7eb; display: flex; gap: 8px; justify-content: flex-end;">
                <button style="padding: 8px 16px; border: 1px solid #d1d5db; border-radius: 6px; background: white; color: #374151; cursor: pointer; font-size: 13px;"><?= htmlspecialchars($cancelLabel ?? 'Cancel') ?></button>
                <button style="padding: 8px 16px; border: none; border-radius: 6px; background: #3b82f6; color: white; cursor: pointer; font-size: 13px;"><?= htmlspecialchars($confirmLabel ?? 'Confirm') ?></button>
            </div>
        <?php endif; ?>
    </div>
</div>
