@props([
    'division' => [],
    'image' => null,
])

{{--
    The accent is scoped to the pane, which is what allows the two divisions to
    sit beside each other on the home page without a section carrying both.
--}}

<article {{ $attributes->merge(['class' => 'pane glass reveal accent-'.$division['accent']]) }}>

    <span class="block h-px w-12 bg-[var(--accent)]" aria-hidden="true"></span>

    <h3 class="heading">{{ $division['name'] }}</h3>

    <p class="body-text measure">{{ $division['summary'] }}</p>

    <p>
        <a href="{{ route($division['route']) }}" class="text-link">
            {{ $division['link_label'] }}
            <span class="arrow" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 256 256"><path d="M40 128h176M144 56l72 72-72 72" fill="none" stroke="currentColor" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
        </a>
    </p>

    @if ($image)
        <div class="pane-shot">
            <x-picture :file="$image['file']" :alt="$image['alt']" sizes="(min-width: 1024px) 560px, 100vw" />
        </div>
    @endif

</article>
