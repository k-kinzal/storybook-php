<div class="card-slot" style="border:1px solid #ddd;border-radius:8px;overflow:hidden;">
    <div style="padding:16px;">
        @if(isset($cardTitle))
            <h4 style="margin:0 0 8px;">{{ $cardTitle }}</h4>
        @endif
        {{ $slot }}
    </div>
    @if(isset($footer))
        <div style="padding:8px 16px;border-top:1px solid #eee;background:#f9fafb;">
            {{ $footer }}
        </div>
    @endif
</div>
