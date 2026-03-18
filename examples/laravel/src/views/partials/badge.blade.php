@php
$colors = [
    'active' => '#22c55e',
    'inactive' => '#ef4444',
    'pending' => '#f59e0b',
];
$color = $colors[$label] ?? '#6b7280';
@endphp
<span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; background: {{ $color }}; color: white;">
    {{ $label }}
</span>
