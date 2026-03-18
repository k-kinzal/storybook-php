<?php
$title = $title ?? 'Sign In';
$showRemember = $showRemember ?? true;
$showForgot = $showForgot ?? true;
$error = $error ?? null;
$buttonText = $buttonText ?? 'Sign In';
?>
<div class="login-form" style="max-width: 360px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px; font-family: system-ui, sans-serif;">
    <h2 style="margin: 0 0 24px; text-align: center; color: #111827;"><?= htmlspecialchars($title) ?></h2>
    <?php if ($error): ?>
    <div class="login-error" style="background-color: #fee2e2; color: #991b1b; padding: 8px 12px; border-radius: 6px; margin-bottom: 16px; font-size: 13px;">
        <?= htmlspecialchars($error) ?>
    </div>
    <?php endif; ?>
    <form>
        <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 4px;">Email</label>
            <input type="email" placeholder="you@example.com" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;" />
        </div>
        <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 4px;">Password</label>
            <input type="password" placeholder="••••••••" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;" />
        </div>
        <?php if ($showRemember || $showForgot): ?>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; font-size: 13px;">
            <?php if ($showRemember): ?>
            <label style="display: flex; align-items: center; gap: 4px; color: #6b7280;">
                <input type="checkbox" /> Remember me
            </label>
            <?php endif; ?>
            <?php if ($showForgot): ?>
            <a href="#" style="color: #3b82f6; text-decoration: none;">Forgot password?</a>
            <?php endif; ?>
        </div>
        <?php endif; ?>
        <button type="submit" style="width: 100%; padding: 10px; background-color: #3b82f6; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer;">
            <?= htmlspecialchars($buttonText) ?>
        </button>
    </form>
</div>
