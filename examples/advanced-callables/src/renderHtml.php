<?php
/**
 * Demonstrates standalone functions that use echo (void return)
 * instead of returning a string. The runner captures output
 * via ob_start()/ob_get_clean().
 */

function renderBanner(string $title, string $subtitle = '', string $bg = '#3b82f6'): void {
    echo "<div class=\"banner\" style=\"background: {$bg}; color: white; padding: 24px 32px; border-radius: 8px; text-align: center; font-family: system-ui;\">";
    echo "<h2 style=\"margin: 0; font-size: 24px;\">" . htmlspecialchars($title) . "</h2>";
    if ($subtitle !== '') {
        echo "<p style=\"margin: 8px 0 0; opacity: 0.9; font-size: 14px;\">" . htmlspecialchars($subtitle) . "</p>";
    }
    echo "</div>";
}

function renderAlert(string $message, string $type = 'info'): void {
    $colors = [
        'info' => ['bg' => '#eff6ff', 'border' => '#3b82f6', 'text' => '#1e40af'],
        'success' => ['bg' => '#f0fdf4', 'border' => '#22c55e', 'text' => '#166534'],
        'warning' => ['bg' => '#fffbeb', 'border' => '#f59e0b', 'text' => '#92400e'],
        'error' => ['bg' => '#fef2f2', 'border' => '#ef4444', 'text' => '#991b1b'],
    ];
    $c = $colors[$type] ?? $colors['info'];
    ?>
    <div class="echo-alert" style="border-left: 4px solid <?= $c['border'] ?>; background: <?= $c['bg'] ?>; color: <?= $c['text'] ?>; padding: 12px 16px; border-radius: 0 6px 6px 0; font-family: system-ui; font-size: 14px;">
        <?= htmlspecialchars($message) ?>
    </div>
    <?php
}
