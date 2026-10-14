@props([
    'file' => null,
    'alt' => '',
    'eager' => false,
    'caption' => null,
    'width' => null,
    'height' => null,
    'uploaded' => false,
    // How wide this image actually renders, so the browser can pick the
    // smallest file that still looks right.
    'sizes' => '(min-width: 1280px) 1152px, 100vw',
])

{{-- A screenshot held in a pane of glass. --}}

<figure {{ $attributes->merge(['class' => 'figure glass']) }}>

    <x-picture :file="$file" :alt="$alt" :eager="$eager" :sizes="$sizes" :width="$width" :height="$height" :uploaded="$uploaded" />

    @if ($caption)
        <figcaption class="small muted">{{ $caption }}</figcaption>
    @endif

</figure>
