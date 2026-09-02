@php
    $accent = config('divisions.'.$project['division'].'.accent', 'brass');
@endphp

<x-layout
    :title="$project['title']"
    :description="$project['description']"
    :image="'images/work/'.$project['index_image']['file'].'.jpg'"
>

    <div class="accent-{{ $accent }}">

        {{-- 1 — Header --}}
        <section class="shell section">

            <div class="measure">
                <p class="eyebrow">{{ $project['eyebrow'] }}</p>
                <h1 class="display-xl">{{ $project['name'] }}</h1>
                <p class="lede">{{ $project['summary'] }}</p>
            </div>

            <dl class="mt-14 grid gap-8 border-t border-line pt-8 sm:grid-cols-3">
                @foreach ($project['meta'] as $item)
                    <div>
                        <dt class="label">{{ $item['label'] }}</dt>
                        <dd class="small m-0 mt-2">{{ $item['value'] }}</dd>
                    </div>
                @endforeach
            </dl>

        </section>

        {{-- 2 — The situation --}}
        <section class="shell section">
            <div class="grid gap-10 md:grid-cols-12 md:gap-8">
                <div class="md:col-span-4">
                    <x-section-heading title="The situation" size="heading" />
                </div>
                <div class="measure reveal md:col-span-8">
                    @foreach ($project['situation'] as $paragraph)
                        <p class="body-text">{{ $paragraph }}</p>
                    @endforeach
                </div>
            </div>
        </section>

        <div class="shell">
            <hr class="rule">
        </div>

        {{-- 3 — The constraint --}}
        <section class="shell section">
            <div class="grid gap-10 md:grid-cols-12 md:gap-8">
                <div class="md:col-span-4">
                    <x-section-heading title="The constraint" size="heading" />
                </div>
                <div class="measure reveal md:col-span-8">
                    @foreach ($project['constraint'] as $paragraph)
                        <p class="body-text">{{ $paragraph }}</p>
                    @endforeach
                </div>
            </div>
        </section>

        <div class="shell">
            <hr class="rule">
        </div>

        {{-- 4 — The decisions. This is what separates a case study from a
             gallery, so it gets the most room on the page. --}}
        <section class="shell section">

            <x-section-heading eyebrow="The decisions" title="What was decided, and why." />

            <div class="mt-14">
                @foreach ($project['decisions'] as $decision)
                    <div class="reveal grid gap-4 border-t border-line py-9 md:grid-cols-12 md:gap-8 @if ($loop->last) border-b @endif">
                        <span class="mono text-[0.6875rem] uppercase tracking-[0.25em] text-[var(--accent-text)] md:col-span-1">
                            {{ str_pad((string) $loop->iteration, 2, '0', STR_PAD_LEFT) }}
                        </span>
                        <h3 class="heading md:col-span-5">{{ $decision['title'] }}</h3>
                        <p class="body-text muted measure md:col-span-6">{{ $decision['body'] }}</p>
                    </div>
                @endforeach
            </div>

        </section>

        {{-- 5 — The result --}}
        <section class="shell section">
            <div class="grid gap-10 md:grid-cols-12 md:gap-8">
                <div class="md:col-span-4">
                    <x-section-heading title="The result" size="heading" />
                </div>
                <div class="measure reveal md:col-span-8">
                    @foreach ($project['result'] as $paragraph)
                        <p class="body-text">{{ $paragraph }}</p>
                    @endforeach
                </div>
            </div>
        </section>

        <div class="shell">
            <hr class="rule">
        </div>

        {{-- 6 — Composition: the stack written the way a formula is. --}}
        <section class="shell section">
            <div class="grid gap-10 md:grid-cols-12 md:gap-8">
                <div class="md:col-span-4">
                    <x-section-heading title="Composition" size="heading" />
                </div>
                <div class="reveal md:col-span-8">
                    <x-composition :layers="$project['composition']" :note="$project['composition_note']" />
                </div>
            </div>
        </section>

        {{-- 7 — Screenshots --}}
        <section class="shell section-tight">
            <div class="flex flex-col gap-8">
                @foreach ($project['images'] as $image)
                    <x-figure
                        :file="$image['file']"
                        :alt="$image['alt']"
                        :eager="$loop->first"
                        class="reveal"
                    />
                @endforeach
            </div>
        </section>

        {{-- 8 — On to the next one --}}
        <section class="shell section">

            <div class="border-t border-line pt-10">

                <div class="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">

                    <a href="{{ route('work.show', $next['slug']) }}" class="group/row block">
                        <span class="label">Next work</span>
                        <span class="heading mt-3 block">{{ $next['name'] }}</span>
                        <span class="mono mt-3 inline-flex items-center gap-2 text-[0.6875rem] uppercase tracking-[0.25em] text-stone">
                            {{ $next['meta_label'] }}
                            <span class="arrow" aria-hidden="true">&rarr;</span>
                        </span>
                    </a>

                    <a href="{{ route('work') }}" class="link-line mono shrink-0 text-[0.6875rem] uppercase tracking-[0.25em] text-stone">
                        All work
                    </a>

                </div>

            </div>

        </section>

    </div>

</x-layout>
