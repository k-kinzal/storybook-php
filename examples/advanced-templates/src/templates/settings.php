<?php
/**
 * Settings panel template with grouped key-value pairs.
 * Demonstrates nested associative arrays and boolean conditionals.
 */
$title = $title ?? 'Application Settings';
$sections = $sections ?? [
    ['heading' => 'General', 'settings' => ['App Name' => 'MyApp', 'Version' => '1.0.0', 'Debug' => 'false']],
    ['heading' => 'Database', 'settings' => ['Driver' => 'mysql', 'Host' => 'localhost', 'Port' => '3306']],
];
$readonly = $readonly ?? false;
$showDescriptions = $showDescriptions ?? true;
?>
<div class="settings-panel" style="font-family: system-ui, sans-serif; max-width: 600px;">
    <h2 style="margin: 0 0 20px; color: #111827;"><?= htmlspecialchars($title) ?></h2>
    <?php foreach ($sections as $section): ?>
        <div class="settings-section" style="margin-bottom: 20px;">
            <h3 style="margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280;"><?= htmlspecialchars($section['heading']) ?></h3>
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <?php $i = 0; foreach ($section['settings'] as $key => $val): ?>
                    <div style="display: flex; justify-content: space-between; padding: 10px 16px; <?= $i > 0 ? 'border-top: 1px solid #f3f4f6;' : '' ?> <?= $readonly ? 'opacity: 0.7;' : '' ?>">
                        <span style="font-weight: 500; color: #374151;"><?= htmlspecialchars($key) ?></span>
                        <span style="color: #6b7280; font-family: system-ui; font-size: 13px;"><?= htmlspecialchars($val) ?></span>
                    </div>
                <?php $i++; endforeach; ?>
            </div>
        </div>
    <?php endforeach; ?>
</div>
