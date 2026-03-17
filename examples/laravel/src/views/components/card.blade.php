<div class="card{{ $featured ? ' card-featured' : '' }}" style="border:1px solid #ddd;border-radius:8px;overflow:hidden;max-width:360px;">
    @if($image)
        <img src="{{ $image }}" alt="{{ $title }}" style="width:100%;height:200px;object-fit:cover;">
    @endif
    <div style="padding:16px;">
        <h3 style="margin:0 0 8px;">{{ $title }}</h3>
        <p style="margin:0;color:#666;">{{ $body }}</p>
        @if($footer)
            <div style="margin-top:12px;padding-top:12px;border-top:1px solid #eee;font-size:14px;color:#999;">
                {{ $footer }}
            </div>
        @endif
    </div>
</div>
