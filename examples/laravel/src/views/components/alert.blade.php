<div class="alert alert-{{ $type }}" role="alert">
    @if($dismissible)
        <button type="button" class="btn-close" aria-label="Close">&times;</button>
    @endif
    <strong>{{ $title }}</strong>
    @if($message)
        <p>{{ $message }}</p>
    @endif
</div>
