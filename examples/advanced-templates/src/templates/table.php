<?php /** @var string $caption */ /** @var array $headers */ /** @var array $rows */ /** @var bool $striped */ ?>
<table style="border-collapse: collapse; width: 100%; font-family: sans-serif;">
    <?php if (!empty($caption)): ?>
        <caption style="caption-side: top; font-weight: bold; padding: 8px;"><?= htmlspecialchars($caption) ?></caption>
    <?php endif; ?>
    <thead>
        <tr style="background-color: #f3f4f6;">
            <?php foreach (($headers ?? []) as $header): ?>
                <th style="padding: 8px 12px; text-align: left; border-bottom: 2px solid #d1d5db;"><?= htmlspecialchars($header) ?></th>
            <?php endforeach; ?>
        </tr>
    </thead>
    <tbody>
        <?php foreach (($rows ?? []) as $i => $row): ?>
            <tr style="<?= (!empty($striped) && $i % 2 === 1) ? 'background-color: #f9fafb;' : '' ?>">
                <?php foreach ($row as $cell): ?>
                    <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;"><?= htmlspecialchars((string) $cell) ?></td>
                <?php endforeach; ?>
            </tr>
        <?php endforeach; ?>
    </tbody>
</table>
