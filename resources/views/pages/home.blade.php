@use('Illuminate\Support\Number')
@use('Illuminate\Support\Str')

@php
    $thesis = ['Things', 'that', 'are', 'not', 'seen,', 'but'];
    $perfumeryShot = ['file' => 'ralph-detail', 'alt' => 'The Ralph de Vinca Perfumery platform explaining why fragrance is worth understanding.'];
    $technologyShot = ['file' => 'absensi-mahasiswa', 'alt' => 'An attendance session in the PKKMB INSTIKI 2026 system, with student names obscured.'];
@endphp

<x-layout>

    {{-- Hero. The thesis comes into focus word by word, and the group is
         written beside it as one formula held in a flacon. --}}
    <section class="shell relative pt-14 pb-20 lg:pt-22 lg:pb-30">

        <div class="glow glow-light" style="width: 68rem; height: 56rem; left: 18%; top: -24rem" aria-hidden="true"></div>
        <div class="glow glow-brass glow-drift" style="width: 56rem; height: 56rem; left: -21rem; top: -12rem" aria-hidden="true"></div>
        <div class="glow glow-vinca glow-drift-slow" style="width: 51rem; height: 51rem; right: -16rem; top: 16rem" aria-hidden="true"></div>

        <div class="grid gap-y-10 lg:grid-cols-12 lg:gap-x-16">

            <h1 class="display-xl text-[clamp(3rem,1.2rem+6.4vw,6.5rem)] lg:col-span-12">
                @foreach ($thesis as $word)<span class="focus-word" style="--i: {{ $loop->index }}">{{ $word }}</span> @endforeach<span class="focus-word" style="--i: {{ count($thesis) }}"><em>felt.</em></span>
            </h1>

            <div class="flex flex-col gap-9 lg:col-span-7 lg:pt-4">
                <p class="lede measure focus-in" style="--d: 650ms">
                    An independent group in Bali with two divisions: one studies fragrance, the other builds software. Both compose things nobody looks at directly, and everybody feels.
                </p>
                <div class="focus-in flex flex-wrap gap-3" style="--d: 800ms">
                    <a href="{{ route('work') }}" class="btn">
                        See the work
                        <span class="arrow" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 256 256"><path d="M40 128h176M144 56l72 72-72 72" fill="none" stroke="currentColor" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
                    </a>
                    <a href="{{ route('contact') }}" class="btn btn-quiet">Start a project</a>
                </div>
            </div>

            <div class="mx-auto w-full max-w-[29rem] lg:col-span-5 lg:-mt-24">
                <x-composition :layers="config('site.composition')" staged label="The group, written as a perfume formula" />
                <p class="small muted focus-in mt-5 text-center" style="--d: 1500ms">The group, written as a perfume formula.</p>
            </div>

        </div>

    </section>

    {{-- The two divisions. The only place on the site where both accent
         colours appear; each pane scopes its own. --}}
    <section class="shell section">

        <div class="glow glow-vinca" style="width: 47rem; height: 47rem; left: -18rem; top: 16rem" aria-hidden="true"></div>
        <div class="glow glow-brass" style="width: 47rem; height: 47rem; right: -19rem; top: 26rem" aria-hidden="true"></div>

        <h2 class="display-l reveal max-w-[16ch]">One standard, two crafts.</h2>

        <div class="mt-16 grid items-start gap-6 md:grid-cols-2 md:gap-8">
            <x-division-card :division="config('divisions.perfumery')" :image="$perfumeryShot" />
            <x-division-card :division="config('divisions.technology')" :image="$technologyShot" class="pane-offset" />
        </div>

    </section>

    {{-- Selected work. Hidden until there is something to show. --}}
    @if ($projects->isNotEmpty())
        <section id="work" class="shell section">

            {{-- The count is derived, never typed: adding a project in the
                 admin must never leave this sentence lying. --}}
            <div class="reveal flex max-w-3xl flex-col gap-6">
                <h2 class="display-l">{{ Str::ucfirst(Number::spell($projects->count())) }} {{ Str::plural('thing', $projects->count()) }} built so far.</h2>
                <p class="lede">All of them are here. Nothing is hidden, and nothing is padded.</p>
            </div>

            <div class="mt-16">
                <x-work-list :projects="$projects" />
            </div>

        </section>
    @endif

    {{-- The four principles, set large: they are the reason the work looks the
         way it does. --}}
    <section class="shell section">

        <div class="glow glow-light" style="width: 56rem; height: 44rem; left: 30%; top: 8rem" aria-hidden="true"></div>

        <h2 class="display-l reveal max-w-[20ch]">Four principles, taken from the name itself.</h2>

        <div class="mt-16 border-t border-line">
            @foreach (config('site.principles') as $principle)
                <div class="principle reveal">
                    <h3 class="principle-name">{{ $principle['name'] }}</h3>
                    <p class="body-text measure-narrow">{!! $principle['body'] !!}</p>
                </div>
            @endforeach
        </div>

    </section>

    {{-- Real words from real clients only. Hidden while there are none. --}}
    @if ($quote = config('site.testimonials')[0] ?? null)
        <section class="shell pb-[var(--section-space)]">
            <figure class="glass reveal m-0 max-w-4xl rounded-[36px] px-7 py-10 md:px-16 md:py-16">
                <blockquote class="m-0">
                    <p class="font-display text-[clamp(1.625rem,1.2rem+1.4vw,2.375rem)] font-light italic leading-[1.3] tracking-[-0.01em]">&ldquo;{{ $quote['quote'] }}&rdquo;</p>
                </blockquote>
                <figcaption class="label mt-7">{{ $quote['name'] }}, {{ $quote['role'] }}, {{ $quote['project'] }}</figcaption>
            </figure>
        </section>
    @endif

    {{-- Closing. One form on the site, and it is not here. --}}
    <x-cta
        heading="Have something that needs <em>building?</em>"
        body="Tell me what the problem is. If it isn't a good fit, I'll say so."
        label="Start a project"
    />

</x-layout>
