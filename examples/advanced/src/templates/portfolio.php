<?php
/**
 * @var string $name
 * @var string $role
 * @var array $skills
 * @var array $projects
 * @var bool $showContact
 */
$name = $name ?? 'Jane Developer';
$role = $role ?? 'Full-Stack Engineer';
$skills = $skills ?? ['PHP', 'TypeScript', 'React'];
$showContact = $showContact ?? true;
$projects = $projects ?? [];
?>
<div class="portfolio" style="max-width: 480px; font-family: system-ui; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
    <div style="padding: 24px; background: linear-gradient(135deg, #1e3a5f, #3b82f6); color: white;">
        <h2 style="margin: 0;"><?= htmlspecialchars($name) ?></h2>
        <p style="margin: 4px 0 0; opacity: 0.85; font-size: 14px;"><?= htmlspecialchars($role) ?></p>
    </div>
    <div style="padding: 20px;">
        <?php if (!empty($skills)): ?>
        <div style="margin-bottom: 16px;">
            <h4 style="margin: 0 0 8px; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Skills</h4>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                <?php foreach ($skills as $skill): ?>
                <span style="padding: 3px 10px; background: #eff6ff; color: #1d4ed8; border-radius: 12px; font-size: 13px;"><?= htmlspecialchars($skill) ?></span>
                <?php endforeach; ?>
            </div>
        </div>
        <?php endif; ?>
        <?php if (!empty($projects)): ?>
        <div style="margin-bottom: 16px;">
            <h4 style="margin: 0 0 8px; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Projects</h4>
            <?php foreach ($projects as $project): ?>
            <div style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
                <strong style="font-size: 14px;"><?= htmlspecialchars($project) ?></strong>
            </div>
            <?php endforeach; ?>
        </div>
        <?php endif; ?>
        <?php if ($showContact): ?>
        <a href="#contact" style="display: inline-block; padding: 8px 16px; background: #3b82f6; color: white; border-radius: 6px; text-decoration: none; font-size: 14px;">Get in touch</a>
        <?php endif; ?>
    </div>
</div>
