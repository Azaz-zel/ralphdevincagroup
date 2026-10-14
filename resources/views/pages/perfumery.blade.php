@php
    $capabilities = [
        [
            'title' => 'Explore fragrances',
            'body' => 'Browse by house, by note, or by how a scent is put together.',
        ],
        [
            'title' => 'Understand notes',
            'body' => 'What a note actually is, what it does inside a composition, and why the same note behaves differently in different hands.',
        ],
        [
            'title' => 'Academy',
            'body' => 'The vocabulary and structure of perfumery, written for people who are starting out.',
        ],
    ];
@endphp

<x-layout>

    {{-- Periwinkle throughout. Brass does not appear on this page. --}}
    <div class="accent-vinca">

        <section class="shell section">
            <div class="measure">
                <p class="eyebrow">{{ config('divisions.perfumery.eyebrow') }}</p>
                <h1 class="display-xl">Fragrance, explained rather than sold.</h1>
                <p class="lede">
                    Perfumery is the culture side of the group. It exists to make scent understandable, not to move product.
                </p>
            </div>
        </section>

        <div class="shell">
            <hr class="rule">
        </div>

        <section class="shell section">

            <div class="grid gap-10 md:grid-cols-12 md:gap-8">

                <div class="md:col-span-4">
                    <x-section-heading title="What it is" size="heading" />
                </div>

                <div class="measure reveal md:col-span-8">

                    <p class="body-text">
                        Ralph de Vinca Perfumery is a platform for people who want to know what they are smelling. Houses, notes, and the way a composition changes over the hours it is worn, laid out as structured information rather than marketing copy.
                    </p>

                    <p class="body-text">
                        It was the first thing built under this name, and it was built without a client, a deadline, or a business plan.
                    </p>

                </div>

            </div>

            {{-- The platform itself. No fragrance of Ralph de Vinca's own
                 exists yet, so nothing here may look like a product. --}}
            <x-figure
                file="ralph-detail"
                alt="The Ralph de Vinca Perfumery platform explaining why fragrance is worth understanding, beside the raw materials a composition is built from."
                sizes="(min-width: 1280px) 1024px, 100vw"
                class="reveal mt-16"
            />

        </section>

        <div class="shell">
            <hr class="rule">
        </div>

        <section class="shell section">

            <x-section-heading title="What you can do there" size="heading" />

            <div class="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
                @foreach ($capabilities as $capability)
                    <div class="reveal">
                        <span class="block h-px w-10 bg-[var(--accent)]" aria-hidden="true"></span>
                        <h3 class="heading mt-6">{{ $capability['title'] }}</h3>
                        <p class="body-text muted mt-4">{{ $capability['body'] }}</p>
                    </div>
                @endforeach
            </div>

        </section>

        <div class="shell">
            <hr class="rule">
        </div>

        <section class="shell section">

            <div class="grid gap-10 md:grid-cols-12 md:gap-8">

                <div class="md:col-span-4">
                    <x-section-heading title="The approach" size="heading" />
                </div>

                <div class="measure reveal md:col-span-8">

                    <p class="body-text">
                        There is no best fragrance. There is only the right one for a person, a climate, and an occasion, and in Bali that usually means heat and humidity, which changes the answer considerably.
                    </p>

                    <p class="body-text">
                        Nothing on the platform is ranked to serve a sale, because nothing on the platform is for sale.
                    </p>

                </div>

            </div>

        </section>

        <div class="shell">
            <hr class="rule">
        </div>

        {{-- A stated plan, not a product. There is nothing to buy or reserve. --}}
        <section class="shell section">

            <div class="grid gap-10 md:grid-cols-12 md:gap-8">

                <div class="md:col-span-4">
                    <x-section-heading title="What comes next" size="heading" />
                </div>

                <div class="measure reveal md:col-span-8">

                    <p class="body-text">
                        Perfumery will become the home of a niche fragrance composed in-house. That work is at the learning stage. There is no product, no release date, and nothing to reserve.
                    </p>

                    <p class="body-text">
                        The order is deliberate. Most independent brands release a bottle first and learn the category afterward. Here the category was studied first, and nothing has been added to it yet.
                    </p>

                </div>

            </div>

        </section>

        <div class="shell">
            <hr class="rule">
        </div>

        <section class="shell section">

            <div class="grid gap-10 md:grid-cols-12 md:gap-8">

                <div class="md:col-span-4">
                    <x-section-heading title="A note on independence" size="heading" />
                </div>

                <div class="measure reveal md:col-span-8">

                    <p class="body-text">
                        When there is eventually something to sell, it will be kept structurally separate from everything above, and own products will never appear in rankings or recommendations.
                    </p>

                    <p class="mt-8">
                        <a href="{{ route('about') }}#editorial-commitment" class="link-line mono inline-flex items-center gap-2 text-[0.6875rem] uppercase tracking-[0.25em] text-[var(--accent-text)]">
                            Read the editorial commitment
                            <span class="arrow" aria-hidden="true">&rarr;</span>
                        </a>
                    </p>

                </div>

            </div>

        </section>

        @if (config('site.links.perfumery'))
            <section class="shell section-tight">
                <div class="reveal border-t border-line pt-12">
                    <a href="{{ config('site.links.perfumery') }}" target="_blank" rel="noopener" class="btn">
                        Visit Ralph de Vinca Perfumery
                        <span class="arrow" aria-hidden="true">&rarr;</span>
                    </a>
                </div>
            </section>
        @endif

    </div>

</x-layout>
