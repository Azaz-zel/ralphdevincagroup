@use('App\Support\Screenshots')

@php
    $images = $project->images ?? [];
    $cover = $project->coverImage();
    $rest = array_values(array_filter($images, fn (array $image) => $image['file'] !== ($cover['file'] ?? null)));
    $nextCover = $next?->coverImage();
@endphp

<x-layout
    :title="$project->pageTitle()"
    :description="$project->pageDescription()"
    :image="$cover ? Screenshots::path($cover['file'], $cover['uploaded'] ?? false) : null"
>

    <div class="accent-{{ $project->accent() }}">

        {{-- Header --}}
        <section class="shell section-open pb-14">

            <div class="glow glow-light" style="width: 62rem; height: 50rem; left: 10%; top: -22rem" aria-hidden="true"></div>
            <div class="glow glow-brass glow-drift" style="width: 56rem; height: 56rem; right: -19rem; top: -17rem" aria-hidden="true"></div>

            <a href="{{ route('work') }}" class="text-link text-text-2">
                <span class="arrow rotate-180" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 256 256"><path d="M40 128h176M144 56l72 72-72 72" fill="none" stroke="currentColor" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
                All work
            </a>

            <h1 class="display-xl mt-8 max-w-[14ch]">{{ $project->name }}</h1>
            <p class="lede measure mt-7">{{ $project->summary }}</p>

            @if (! empty($project->facts))
                <dl class="facts glass mt-10 max-w-3xl">
                    @foreach ($project->facts as $fact)
                        <div class="fact">
                            <dt class="label">{{ $fact['label'] }}</dt>
                            <dd class="m-0 mt-1.5">{{ $fact['value'] }}</dd>
                        </div>
                    @endforeach
                </dl>
            @endif

        </section>

        @if ($cover)
            <section class="shell">
                <x-figure
                    :file="$cover['file']"
                    :alt="$cover['alt']"
                    :width="$cover['width'] ?? null"
                    :height="$cover['height'] ?? null"
                    :uploaded="$cover['uploaded'] ?? false"
                    eager
                />
            </section>
        @endif

        {{-- The story, in the order it happened. The decisions get the most
             room, because they are what separates a case study from a gallery. --}}
        <section class="shell section">

            <div class="glow glow-vinca glow-drift-slow" style="width: 44rem; height: 44rem; left: -20rem; top: 30%" aria-hidden="true"></div>

            <div class="story reveal">
                <h2 class="story-label heading">Situation</h2>
                <div class="measure">
                    @foreach ($project->paragraphs('situation') as $paragraph)
                        <p class="body-text text-[1.0625rem]">{{ $paragraph }}</p>
                    @endforeach
                </div>
            </div>

            @if ($project->paragraphs('constraint'))
                <div class="story reveal">
                    <h2 class="story-label heading">Constraint</h2>
                    <div class="measure">
                        @foreach ($project->paragraphs('constraint') as $paragraph)
                            <p class="body-text text-[1.0625rem]">{{ $paragraph }}</p>
                        @endforeach
                    </div>
                </div>
            @endif

            <div class="story reveal">
                <h2 class="story-label heading">Decisions</h2>
                <div class="glass rounded-[32px] p-1.5">
                    @foreach ($project->decisions as $decision)
                        <div class="decision">
                            <h3 class="decision-title">{{ $decision['title'] }}</h3>
                            <p class="body-text">{{ $decision['body'] }}</p>
                        </div>
                    @endforeach
                </div>
            </div>

            <div class="story reveal">
                <h2 class="story-label heading">Result</h2>
                <div class="measure">
                    @foreach ($project->paragraphs('result') as $paragraph)
                        <p class="body-text text-[1.0625rem]">{{ $paragraph }}</p>
                    @endforeach
                </div>
            </div>

        </section>

        @if ($rest)
            <section class="shell flex flex-col gap-8">
                @foreach ($rest as $image)
                    <x-figure
                        :file="$image['file']"
                        :alt="$image['alt']"
                        :width="$image['width'] ?? null"
                        :height="$image['height'] ?? null"
                        :uploaded="$image['uploaded'] ?? false"
                        class="reveal"
                    />
                @endforeach
            </section>
        @endif

        {{-- Composition: the stack written the way a formula is. --}}
        <section class="shell section">
            <div class="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
                <div class="reveal flex flex-col gap-5 lg:col-span-6">
                    <h2 class="display-l">What it is made of.</h2>
                    <p class="body-text measure-narrow">Top is the layer a person feels directly. Heart is the logic working underneath. Base is the foundation that outlasts everything above it.</p>
                </div>
                <div class="reveal mx-auto w-full max-w-[29rem] lg:col-span-5 lg:col-start-8">
                    <x-composition :layers="$project->composition()" label="The stack, written as a perfume formula" />
                </div>
            </div>
        </section>

        {{-- On to the next one --}}
        @if ($next)
            <section class="shell pb-[var(--section-space)]">
                <a href="{{ route('work.show', $next) }}" class="next-case glass reveal">
                    <span class="flex flex-col gap-4">
                        <span class="label">Next case study</span>
                        <span class="display-l">{{ $next->name }}</span>
                        <span class="body-text">{{ $next->summary }}</span>
                        <span class="text-link">
                            Read it
                            <span class="arrow" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 256 256"><path d="M40 128h176M144 56l72 72-72 72" fill="none" stroke="currentColor" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
                        </span>
                    </span>
                    @if ($nextCover)
                        <x-picture
                            :file="$nextCover['file']"
                            alt=""
                            :width="$nextCover['width'] ?? null"
                            :height="$nextCover['height'] ?? null"
                            :uploaded="$nextCover['uploaded'] ?? false"
                            sizes="(min-width: 1024px) 560px, 100vw"
                        />
                    @endif
                </a>
            </section>
        @endif

    </div>

</x-layout>
