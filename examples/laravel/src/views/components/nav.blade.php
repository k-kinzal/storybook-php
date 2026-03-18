<nav style="display: flex; align-items: center; gap: 24px; padding: 12px 24px; background: #1f2937; color: white;">
    <strong style="font-size: 18px;">{{ $brand }}</strong>
    <ul style="display: flex; gap: 16px; list-style: none; margin: 0; padding: 0;">
        @foreach ($items as $item)
            <li>
                <a href="{{ $item['href'] }}"
                   style="color: {{ !empty($item['active']) ? '#60a5fa' : '#d1d5db' }}; text-decoration: none;">
                    {{ $item['label'] }}
                    @if ($loop->first)
                        <span style="font-size: 10px;">&#9733;</span>
                    @endif
                </a>
            </li>
        @endforeach
    </ul>
</nav>
