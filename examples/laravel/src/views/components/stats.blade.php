<div class="stats-grid" style="display:grid;grid-template-columns:repeat({{ count($items) }}, 1fr);gap:16px;">
    @foreach($items as $item)
        <div class="stat-card" style="padding:16px;border:1px solid #e2e8f0;border-radius:8px;text-align:center;">
            <div style="font-size:24px;font-weight:bold;color:{{ $color }};">{{ $item['value'] }}</div>
            <div style="font-size:14px;color:#64748b;margin-top:4px;">{{ $item['label'] }}</div>
        </div>
    @endforeach
</div>
