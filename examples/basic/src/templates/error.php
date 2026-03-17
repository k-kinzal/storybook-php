<?php
$code = $code ?? 404;
$message = $message ?? null;
$showHome = $showHome ?? true;

$defaults = [
    400 => ['title' => 'Bad Request', 'description' => 'The server could not understand your request.', 'icon' => '&#x26D4;'],
    401 => ['title' => 'Unauthorized', 'description' => 'You need to sign in to access this page.', 'icon' => '&#x1F512;'],
    403 => ['title' => 'Forbidden', 'description' => 'You do not have permission to access this resource.', 'icon' => '&#x1F6AB;'],
    404 => ['title' => 'Not Found', 'description' => 'The page you are looking for does not exist.', 'icon' => '&#x1F50D;'],
    500 => ['title' => 'Internal Server Error', 'description' => 'Something went wrong on our end.', 'icon' => '&#x26A0;'],
    503 => ['title' => 'Service Unavailable', 'description' => 'We are currently undergoing maintenance. Please try again later.', 'icon' => '&#x1F527;'],
];

$info = $defaults[$code] ?? ['title' => 'Error', 'description' => 'An unexpected error occurred.', 'icon' => '&#x2757;'];
$description = $message ?? $info['description'];
?>
<div class="error-page" style="text-align: center; padding: 48px 24px; font-family: system-ui, sans-serif;">
    <div class="error-icon" style="font-size: 64px; margin-bottom: 16px;"><?= $info['icon'] ?></div>
    <h1 class="error-code" style="font-size: 72px; font-weight: 700; color: #111827; margin: 0;"><?= $code ?></h1>
    <h2 class="error-title" style="font-size: 24px; color: #374151; margin: 8px 0 16px;"><?= htmlspecialchars($info['title']) ?></h2>
    <p class="error-description" style="color: #6b7280; font-size: 16px; max-width: 400px; margin: 0 auto 24px;">
        <?= htmlspecialchars($description) ?>
    </p>
    <?php if ($showHome): ?>
    <a href="/" class="error-home" style="display: inline-block; padding: 10px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
        Go Home
    </a>
    <?php endif; ?>
</div>
