<div style="max-width: 720px; margin: 0 auto; font-family: sans-serif;">
    <h1 style="margin-bottom: 4px;">{{ $title }}</h1>
    <p style="color: #6b7280; margin-top: 0;">{{ $subtitle }}</p>

    {{-- Pattern 1+2: Component class → @include (section-header partial) --}}
    <section data-pattern="include" style="margin-bottom: 24px;">
        @include('partials.section-header', ['heading' => $title, 'subtitle' => $subtitle])
    </section>

    {{-- Pattern 3: @include → @include (nested-wrapper → badge) --}}
    <section data-pattern="nested-include" style="margin-bottom: 24px;">
        @include('partials.nested-wrapper', ['label' => 'active', 'wrapperTitle' => 'Nested Wrapper'])
    </section>

    {{-- Pattern 4: @component / @slot --}}
    <section data-pattern="component-slot" style="margin-bottom: 24px;">
        @component('layouts.card-slot')
            @slot('cardTitle')
                Slot Example
            @endslot
            <p style="margin: 0;">This content is in the default slot.</p>
            @slot('footer')
                @include('partials.badge', ['label' => 'active'])
            @endslot
        @endcomponent
    </section>

    {{-- Pattern 5: @each --}}
    <section data-pattern="each" style="margin-bottom: 24px;">
        <h3 style="margin-bottom: 8px;">Items (@@each)</h3>
        @each('partials.list-item', $items, 'item')
    </section>

    {{-- Pattern 6+7: @include → @component (mixed nesting) --}}
    <section data-pattern="include-then-component" style="margin-bottom: 24px;">
        @include('partials.component-wrapper', ['wrapperHeading' => 'Mixed Nesting'])
    </section>

    {{-- Conditional section using $showAlert --}}
    @if($showAlert)
        <section data-pattern="alert" style="margin-bottom: 24px; padding: 12px 16px; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; color: #92400e;">
            <strong>Alert:</strong> This alert is conditionally rendered via $showAlert.
        </section>
    @endif
</div>
