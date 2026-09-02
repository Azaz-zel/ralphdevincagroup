@php
    $offerings = [
        [
            'title' => 'A website for a business',
            'body' => 'A place people can find you, understand what you offer, and get in touch or book.',
        ],
        [
            'title' => 'An internal system',
            'body' => 'Attendance, records, bookings, scheduling. Anything currently held together by spreadsheets, paper, and memory.',
        ],
        [
            'title' => 'A data-driven platform',
            'body' => 'For when information needs structure rather than pages: catalogues, directories, archives.',
        ],
    ];

    $stages = [
        [
            'number' => '01',
            'title' => 'A conversation',
            'body' => 'You describe the problem. No commitment and no charge at this stage.',
        ],
        [
            'number' => '02',
            'title' => 'Scope and estimate',
            'body' => 'What will be built, what will not, and what it costs. In writing, before anything begins.',
        ],
        [
            'number' => '03',
            'title' => 'Building',
            'body' => 'Regular updates, so you always know where things stand without having to ask.',
        ],
        [
            'number' => '04',
            'title' => 'Handover and support',
            'body' => 'You receive the working system, and a period of support after it goes live.',
        ],
    ];

    $tools = ['PHP', 'Laravel', 'Blade', 'Tailwind CSS', 'MySQL'];
@endphp

<x-layout>

    {{-- Brass throughout. Periwinkle does not appear on this page. --}}
    <div class="accent-brass">

        <section class="shell section">
            <div class="measure">
                <p class="eyebrow">{{ config('divisions.technology.eyebrow') }}</p>
                <h1 class="display-xl">Systems that hold.</h1>
                <p class="lede">
                    Technology builds websites and internal systems for businesses and institutions.
                </p>
            </div>
        </section>

        <div class="shell">
            <hr class="rule">
        </div>

        <section class="shell section">

            <div class="grid gap-10 md:grid-cols-12 md:gap-8">

                <div class="md:col-span-4">
                    <x-section-heading title="What this division does" size="heading" />
                </div>

                <div class="measure reveal md:col-span-8">

                    <p class="body-text">
                        Most small businesses and institutions do not need something impressive. They need something that works on the day it matters, and keeps working afterward without anyone thinking about it.
                    </p>

                    <p class="body-text">
                        That is the whole job.
                    </p>

                </div>

            </div>

            <x-figure
                file="balicebelok"
                alt="The Bali Cebelok Gesiuh site, where a visitor learns what the experience is and books a place."
                sizes="(min-width: 1280px) 1024px, 100vw"
                class="reveal mt-16"
            />

        </section>

        <div class="shell">
            <hr class="rule">
        </div>

        {{-- Delivery time is never promised. The PKKMB week is stated as
             something that happened under a deadline, not as an offer. --}}
        <section class="shell section">

            <div class="grid gap-10 md:grid-cols-12 md:gap-8">

                <div class="md:col-span-4">
                    <x-section-heading title="How the work is made" size="heading" />
                </div>

                <div class="measure reveal md:col-span-8">

                    <p class="body-text">
                        Delivery time is not promised in advance. Scope decides it, and every project has a different one.
                    </p>

                    <p class="body-text">
                        What is promised is the method. Architectural decisions are made correctly at the start, so nothing has to be torn down halfway through. This removes rework, and it is the reason a system can still be finished when there is very little time left.
                    </p>

                    <p class="body-text">
                        The PKKMB attendance system was finished in one week because the deadline left one week. That shows what is possible when circumstances demand it. It is not a service standard.
                    </p>

                </div>

            </div>

        </section>

        <div class="shell">
            <hr class="rule">
        </div>

        <section class="shell section">

            <x-section-heading title="What can be built" size="heading" />

            <div class="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
                @foreach ($offerings as $offering)
                    <div class="reveal">
                        <span class="block h-px w-10 bg-[var(--accent)]" aria-hidden="true"></span>
                        <h3 class="heading mt-6">{{ $offering['title'] }}</h3>
                        <p class="body-text muted mt-4">{{ $offering['body'] }}</p>
                    </div>
                @endforeach
            </div>

            {{-- An internal system, actually running. Student names and ID
                 numbers are obscured in the file itself, not with CSS. --}}
            <x-figure
                file="absensi-mahasiswa"
                alt="An internal attendance system in use, listing one class so a session leader can mark students present. Student names and ID numbers are obscured."
                sizes="(min-width: 1280px) 1024px, 100vw"
                class="reveal mt-16"
            />

        </section>

        <div class="shell">
            <hr class="rule">
        </div>

        {{-- The section that answers a non-technical client's real fear:
             not knowing what is happening. --}}
        <section class="shell section">

            <x-section-heading title="How a project runs" size="heading" />

            <ol class="mt-12">
                @foreach ($stages as $stage)
                    <li class="reveal grid gap-3 border-t border-line py-8 md:grid-cols-12 md:gap-8 @if ($loop->last) border-b @endif">
                        <span class="mono text-[0.6875rem] uppercase tracking-[0.25em] text-[var(--accent-text)] md:col-span-2">
                            {{ $stage['number'] }}
                        </span>
                        <h3 class="heading-sm md:col-span-4">{{ $stage['title'] }}</h3>
                        <p class="body-text muted measure md:col-span-6">{{ $stage['body'] }}</p>
                    </li>
                @endforeach
            </ol>

        </section>

        {{-- Last, and small. A client does not care; a technical reader will
             come looking. --}}
        <section class="shell section-tight">
            <div class="reveal flex flex-wrap items-baseline gap-x-6 gap-y-3">
                <h2 class="label">Tools</h2>
                <p class="mono small muted m-0">
                    {{ implode(' · ', $tools) }}
                </p>
            </div>
        </section>

        <x-cta
            heading="Describe the problem, not the solution."
            body="The problem is usually more useful. Tell me what is slow, manual, or missing, and I'll tell you whether it's something I can fix."
            label="Start a project"
        />

    </div>

</x-layout>
