@props([
    'division' => [],
])

{{--
    The accent is scoped to the card, which is what allows the two divisions to
    sit beside each other on the home page without a section carrying both.
--}}

<div {{ $attributes->merge(['class' => 'card accent-'.$division['accent'].' reveal flex flex-col p-8 md:p-10']) }}>

    <span class="block h-px w-12 bg-[var(--accent)]" aria-hidden="true"></span>

    <h3 class="heading mt-8">{{ $division['name'] }}</h3>

    <p class="body-text muted measure mt-5 grow">{{ $division['summary'] }}</p>

    <p class="mt-8">
        <a href="{{ route($division['route']) }}" class="link-line mono inline-flex items-center gap-2 text-[0.6875rem] uppercase tracking-[0.25em] text-[var(--accent-text)]">
            {{ $division['link_label'] }}
            <span class="arrow" aria-hidden="true">&rarr;</span>
        </a>
    </p>

</div>
