<x-layout>

    {{-- 1 — Hero. The signature element of the site: the group written as one
         three-layer composition. No reveal class here; it is above the fold
         and the composition has its own staged entrance. --}}
    <section class="shell section">

        <div class="grid gap-12 lg:grid-cols-12 lg:gap-8">

            <div class="lg:col-span-7">

                <p class="eyebrow">Ralph de Vinca Group</p>

                <h1 class="display-xl">Things that are not seen, but felt.</h1>

                <p class="lede measure">
                    An independent group in Bali with two divisions: one studies fragrance, the other builds software. Both compose things nobody looks at directly, and everybody feels.
                </p>

                <div class="mt-10 flex flex-wrap items-center gap-4">
                    <a href="{{ route('work') }}" class="btn">
                        See the work
                        <span class="arrow" aria-hidden="true">&rarr;</span>
                    </a>
                    <a href="{{ route('contact') }}" class="btn btn-quiet">
                        Start a project
                    </a>
                </div>

            </div>

            <div class="lg:col-span-5 lg:pt-14">
                <x-composition :layers="config('site.composition')" staged />
            </div>

        </div>

    </section>

    {{-- 2 — The two divisions. The only place on the site where both accent
         colours appear; each card scopes its own. --}}
    <section class="shell section">

        <x-section-heading eyebrow="Two divisions" title="One standard, two crafts." />

        <div class="mt-14 grid gap-6 md:grid-cols-2 md:gap-8">
            <x-division-card :division="config('divisions.perfumery')" />
            <x-division-card :division="config('divisions.technology')" />
        </div>

    </section>

    {{-- 3 — Selected work. A list, not a grid of cards. --}}
    <section class="shell section">

        <x-section-heading
            eyebrow="Selected work"
            title="Three things built so far."
            sub="All of them are here. Nothing is hidden, and nothing is padded."
        />

        <div class="mt-14">
            @foreach (config('projects') as $project)
                <x-work-row :project="$project" />
            @endforeach
        </div>

    </section>

    {{-- 4 — The four principles. --}}
    <section class="shell section">

        <x-section-heading eyebrow="How the work is made" title="Four principles, taken from the name itself." />

        <div class="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            @foreach (config('site.principles') as $principle)
                <div class="reveal">
                    <span class="block h-px w-10 bg-[var(--accent)]" aria-hidden="true"></span>
                    <h3 class="heading mt-6">{{ $principle['name'] }}</h3>
                    <p class="body-text muted mt-4">{!! $principle['body'] !!}</p>
                </div>
            @endforeach
        </div>

    </section>

    {{-- 5 — Closing. One form on the site, and it is not here. --}}
    <x-cta
        heading="Have something that needs building?"
        body="Tell me what the problem is. If it isn't a good fit, I'll say so."
        label="Start a project"
    />

</x-layout>
