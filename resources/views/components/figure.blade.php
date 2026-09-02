@props([
    'file' => null,
    'alt' => '',
    'eager' => false,
    'caption' => null,
    // How wide this image actually renders, so the browser can pick the
    // smallest file that still looks right.
    'sizes' => '(min-width: 1280px) 1024px, (min-width: 768px) 80vw, 100vw',
])

@php
    [$width, $height] = config('images.'.$file, [1600, 800]);

    $widths = [800, 1200, 1600];

    $srcset = fn (string $extension) => collect($widths)
        ->map(fn (int $w) => asset("images/work/{$file}-{$w}w.{$extension}")." {$w}w")
        ->implode(', ');
@endphp

{{-- WebP first, with JPEG kept as a fallback for anything that cannot read it. --}}

<figure {{ $attributes->merge(['class' => 'figure']) }}>

    <picture>
        <source type="image/webp" srcset="{{ $srcset('webp') }}" sizes="{{ $sizes }}">
        <source type="image/jpeg" srcset="{{ $srcset('jpg') }}" sizes="{{ $sizes }}">
        <img
            src="{{ asset('images/work/'.$file.'.jpg') }}"
            alt="{{ $alt }}"
            width="{{ $width }}"
            height="{{ $height }}"
            class="w-full"
            loading="{{ $eager ? 'eager' : 'lazy' }}"
            decoding="{{ $eager ? 'sync' : 'async' }}"
            @if ($eager) fetchpriority="high" @endif
        >
    </picture>

    @if ($caption)
        <figcaption class="small muted border-t border-line px-5 py-4">{{ $caption }}</figcaption>
    @endif

</figure>
