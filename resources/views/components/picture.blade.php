@use('App\Support\Screenshots')

@props([
    'file' => null,
    'alt' => '',
    'eager' => false,
    'width' => null,
    'height' => null,
    'uploaded' => false,
    'sizes' => '100vw',
])

@php
    // Uploaded screenshots carry their own size; the ones that ship with the
    // repository are listed in config/images.php.
    [$width, $height] = $width && $height
        ? [$width, $height]
        : config('images.'.$file, [1600, 800]);

    $widths = [800, 1200, 1600];

    $srcset = fn (string $extension) => collect($widths)
        ->map(fn (int $w) => asset(Screenshots::path((string) $file, $uploaded, "-{$w}w.{$extension}"))." {$w}w")
        ->implode(', ');
@endphp

{{-- WebP first, with JPEG kept as a fallback for anything that cannot read it.
     Width and height are always present, so the page never shifts. --}}

<picture>
    <source type="image/webp" srcset="{{ $srcset('webp') }}" sizes="{{ $sizes }}">
    <source type="image/jpeg" srcset="{{ $srcset('jpg') }}" sizes="{{ $sizes }}">
    <img
        src="{{ asset(Screenshots::path((string) $file, $uploaded)) }}"
        alt="{{ $alt }}"
        width="{{ $width }}"
        height="{{ $height }}"
        {{ $attributes->merge(['class' => 'w-full']) }}
        loading="{{ $eager ? 'eager' : 'lazy' }}"
        decoding="{{ $eager ? 'sync' : 'async' }}"
        @if ($eager) fetchpriority="high" @endif
    >
</picture>
