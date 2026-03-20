<div style="display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
    <span>{{ $item['name'] }}</span>
    @include('partials.badge', ['label' => $item['status']])
</div>
