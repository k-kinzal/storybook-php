<?php /** @var string $city */ /** @var int $temperature */ /** @var string $condition */ /** @var int $humidity */ /** @var int $windSpeed */ ?>
<?php
$city = $city ?? 'Tokyo';
$temperature = $temperature ?? 22;
$condition = $condition ?? 'sunny';
$humidity = $humidity ?? 60;
$windSpeed = $windSpeed ?? 12;
$icon = match ($condition) {
    'sunny' => '&#9728;&#65039;',
    'cloudy' => '&#9729;&#65039;',
    'rainy' => '&#127783;&#65039;',
    'snowy' => '&#10052;&#65039;',
    default => '&#127780;&#65039;',
};
$tempColor = match (true) {
    $temperature < 0 => '#3b82f6',
    $temperature < 15 => '#06b6d4',
    $temperature < 25 => '#22c55e',
    $temperature < 35 => '#f59e0b',
    default => '#ef4444',
};
?>
<div class="weather-card" style="display: inline-block; padding: 24px; border-radius: 12px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1px solid #bae6fd; font-family: system-ui; min-width: 220px;">
    <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px;"><?= htmlspecialchars($city) ?></div>
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
        <span style="font-size: 36px;"><?= $icon ?></span>
        <span style="font-size: 36px; font-weight: bold; color: <?= $tempColor ?>;"><?= $temperature ?>&deg;C</span>
    </div>
    <div style="font-size: 14px; color: #4b5563; text-transform: capitalize; margin-bottom: 12px;"><?= htmlspecialchars($condition) ?></div>
    <div style="display: flex; gap: 16px; font-size: 13px; color: #6b7280;">
        <span>&#128167; <?= $humidity ?>%</span>
        <span>&#127788;&#65039; <?= $windSpeed ?> km/h</span>
    </div>
</div>
