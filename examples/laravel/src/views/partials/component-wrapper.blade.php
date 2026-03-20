<div style="padding: 12px; background: #f9fafb; border-radius: 8px;">
    <h3 style="margin: 0 0 8px;">{{ $wrapperHeading }}</h3>
    @component('layouts.card-slot')
        @slot('cardTitle')
            Inside Include
        @endslot
        <p style="margin: 0;">This component lives inside an include partial.</p>
        @slot('footer')
            @include('partials.badge', ['label' => 'pending'])
        @endslot
    @endcomponent
</div>
