<div class="profile" style="display: flex; align-items: center; gap: 12px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;">
    <img src="{{ $avatar }}" alt="{{ $name }}" style="width: 64px; height: 64px; border-radius: 50%;" />
    <div>
        <h3 style="margin: 0;">{{ $name }}</h3>
        <p style="margin: 4px 0 0; color: #6b7280;">{{ $role }}</p>
        <x-slot:header>
            <span style="font-size: 12px; color: #9ca3af;">{{ $initials() }}</span>
        </x-slot:header>
    </div>
</div>
