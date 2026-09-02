@props([
    'eyebrow' => null,
    'title' => null,
    'level' => 'h2',
    'size' => 'display-l',
    'sub' => null,
])

<div {{ $attributes->merge(['class' => 'reveal']) }}>

    @if ($eyebrow)
        <p class="eyebrow">{{ $eyebrow }}</p>
    @endif

    @if ($title)
        <{{ $level }} class="{{ $size }}">{{ $title }}</{{ $level }}>
    @endif

    @if ($sub)
        <p class="lede measure">{{ $sub }}</p>
    @endif

    {{ $slot }}

</div>
