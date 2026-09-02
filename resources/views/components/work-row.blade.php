@props([
    'project' => [],
    'summaryKey' => 'index_summary',
    // h3 under a section heading, h2 where the row is the page's top-level
    // content and there is no section heading above it.
    'level' => 'h3',
])

@php
    $accent = config('divisions.'.$project['division'].'.accent', 'brass');
@endphp

{{--
    A horizontal row rather than a card in a grid.

    On a pointer device the preview is taken out of the flow and floated at the
    right of the row, so hovering changes nothing about the layout: the row
    keeps its height, the page below never reflows, and only opacity and
    transform animate. On touch it stays in the flow, below the text, where it
    is simply always visible.
--}}

<a
    href="{{ route('work.show', $project['slug']) }}"
    class="work-row reveal accent-{{ $accent }} group/row"
>

    <div class="grid gap-4 lg:grid-cols-12 lg:gap-10">

        <div class="lg:col-span-1">
            <span class="mono text-[0.6875rem] uppercase tracking-[0.25em] text-stone">{{ $project['number'] }}</span>
        </div>

        <div class="lg:col-span-7">

            <{{ $level }} class="heading">{{ $project['name'] }}</{{ $level }}>

            <p class="label mt-2">{{ $project['meta_label'] }}</p>

            <p class="body-text measure mt-4">{{ $project[$summaryKey] }}</p>

            <span class="mono mt-5 inline-flex items-center gap-2 text-[0.6875rem] uppercase tracking-[0.25em] text-stone group-hover/row:text-ink">
                View
                <span class="arrow" aria-hidden="true">&rarr;</span>
            </span>

        </div>

    </div>

    <div class="work-preview">
        <x-figure
            :file="$project['index_image']['file']"
            :alt="$project['index_image']['alt']"
            sizes="(min-width: 1024px) 380px, 100vw"
        />
    </div>

</a>
