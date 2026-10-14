@php
    $name = [
        [
            'term' => 'Ralph',
            'body' => 'From the Old Germanic <em>Radulf</em>: <em>rād</em>, counsel, and <em>wulf</em>, wolf. Literally, wise counsel. The wolf here is not a symbol of aggression. Wolves hunt by calculation, and live in a group.',
        ],
        [
            'term' => 'de',
            'body' => 'French and Italian for &ldquo;of&rdquo;. It marks where something comes from.',
        ],
        [
            'term' => 'Vinca',
            'body' => 'The plant genus <em>Vinca</em>, known in Indonesia as tapak dara. From the Latin <em>vincire</em>, to bind. Vinca is evergreen, grows in shade, spreads slowly, and is almost impossible to kill.',
        ],
    ];

    $rules = [
        [
            'number' => '01',
            'title' => 'Own products never appear in editorial.',
            'body' => 'Not in rankings, not in recommendations, not in Academy material. This holds even if the product turns out to be the best one made.',
        ],
        [
            'number' => '02',
            'title' => 'Scent descriptions are written as they are, weaknesses included.',
            'body' => 'If it lasts four hours, it says four hours. This will look like a disadvantage at first. That is the point.',
        ],
        [
            'number' => '03',
            'title' => 'Ownership is stated openly.',
            'body' => 'Ralph de Vinca Perfumery owns its own fragrance house, and never reviews its own products.',
        ],
    ];
@endphp

<x-layout>

    {{-- Page header --}}
    <section class="shell section">
        <div class="measure">
            <h1 class="display-xl">Wisdom that binds, and endures.</h1>
        </div>
    </section>

    <div class="shell">
        <hr class="rule">
    </div>

    {{-- 1. The name --}}
    <section id="the-name" class="shell section">

        <div class="grid gap-10 md:grid-cols-12 md:gap-8">

            <div class="md:col-span-4">
                <x-section-heading title="The name" size="heading" />
            </div>

            <div class="md:col-span-8">

                <p class="lede measure reveal">
                    The name came before anything it now stands for. This is what it turned out to mean.
                </p>

                <dl class="mt-12 reveal">
                    @foreach ($name as $entry)
                        <div class="grid gap-2 border-t border-line py-7 md:grid-cols-4 md:gap-8 @if ($loop->last) border-b @endif">
                            <dt class="font-display text-2xl leading-none md:col-span-1">{{ $entry['term'] }}</dt>
                            <dd class="body-text measure m-0 md:col-span-3">{!! $entry['body'] !!}</dd>
                        </div>
                    @endforeach
                </dl>

                <p class="heading measure mt-12 reveal">
                    Put together: wisdom that binds, and endures.
                </p>

            </div>

        </div>

    </section>

    <div class="shell">
        <hr class="rule">
    </div>

    {{-- 2. What this is built on --}}
    <section id="what-this-is-built-on" class="shell section">

        <div class="grid gap-10 md:grid-cols-12 md:gap-8">

            <div class="md:col-span-4">
                <x-section-heading title="What this is built on" size="heading" />
            </div>

            <div class="measure reveal md:col-span-8">

                <p class="body-text">
                    Any group that covers more than one field has to answer one question before anything else: why do these things belong under one roof? Without an answer, a group is only a name attached to unrelated work.
                </p>

                <p class="body-text">
                    The answer here is that perfume is invisible architecture that changes how a person feels, and good software works exactly the same way. Nobody sees a database schema or the decisions behind it, but everybody feels the difference between something that runs smoothly and something that hurts to use.
                </p>

                <p class="body-text">
                    Both are hidden compositions with consequences you can feel.
                </p>

                <p class="body-text">
                    This was not decided first and proven later. It had already happened. The first thing built under this name was software about perfume.
                </p>

            </div>

        </div>

    </section>

    <div class="shell">
        <hr class="rule">
    </div>

    {{-- 3. How it happened --}}
    <section id="how-it-happened" class="shell section">

        <div class="grid gap-10 md:grid-cols-12 md:gap-8">

            <div class="md:col-span-4">
                <x-section-heading title="How it happened" size="heading" />
            </div>

            <div class="measure reveal md:col-span-8">

                <p class="body-text">
                    The name was chosen while changing a username in a game. It was picked because it sounded French, like something with a long history, at a point when it had no history at all.
                </p>

                <p class="body-text">
                    What followed ran opposite to the way most companies begin. The name existed first. The substance came after.
                </p>

                <p class="body-text">
                    <strong>The first substance came from an interest.</strong> Ralph de Vinca Perfumery was built not as a shop but as a place to understand scent: the structure of notes, the houses, the way a composition unfolds on skin. A project born from a hobby, built to a standard nobody was asking for.
                </p>

                <p class="body-text">
                    <strong>The second came from outside.</strong> An uncle asked for a website for his business, and Bali Cebelok Gesiuh followed: a booking platform for a traditional coconut oil experience passed down through generations. For the first time, the name was used to solve someone else&rsquo;s problem.
                </p>

                <p class="body-text">
                    <strong>The third came from campus.</strong> Before PKKMB, a manual paper-based attendance process was replaced with a system that worked. Not a project that was requested. A project that was obviously needed.
                </p>

                <p class="body-text">
                    The three look unrelated: fragrance, tourism, a campus system. The pattern is clear from a distance: all three are invisible structures that change how people experience something.
                </p>

                <p class="body-text">
                    Ralph de Vinca Group was not designed on paper. It was noticed, after the pattern had already happened.
                </p>

                <p class="body-text">
                    One detail is worth keeping. Perfumery was built first, and paid work arrived afterward. The work came because the hobby was taken seriously, not the other way around.
                </p>

            </div>

        </div>

    </section>

    <div class="shell">
        <hr class="rule">
    </div>

    {{-- 4. Four principles. Rendered from config so this page and the home
         page can never drift apart. --}}
    <section id="four-principles" class="shell section">

        <div class="grid gap-10 md:grid-cols-12 md:gap-8">

            <div class="md:col-span-4">
                <x-section-heading title="Four principles" size="heading" />
            </div>

            <div class="md:col-span-8">

                <div class="glass grid overflow-hidden rounded-[28px] sm:grid-cols-2">
                    @foreach (config('site.principles') as $principle)
                        <div class="reveal border-line p-8 not-first:border-t sm:nth-2:border-t-0 sm:even:border-l">
                            <h3 class="heading-sm">{{ $principle['name'] }}</h3>
                            <p class="body-text muted mt-4">{!! $principle['body'] !!}</p>
                        </div>
                    @endforeach
                </div>

            </div>

        </div>

    </section>

    <div class="shell">
        <hr class="rule">
    </div>

    {{-- 5. The founder --}}
    <section id="the-founder" class="shell section">

        <div class="grid gap-10 md:grid-cols-12 md:gap-8">

            <div class="md:col-span-4">
                <x-section-heading title="The founder" size="heading" />
            </div>

            <div class="measure reveal md:col-span-8">

                <p class="heading">Ralph de Vinca is run by one person.</p>

                <p class="body-text mt-6">
                    Adrian, based in Bali, Indonesia. Studying Informatics at INSTIKI, with a focus on data and information management. Perfumery is the interest taken seriously. Technology is the training put to use. The group exists so neither one has to be given up.
                </p>

                <p class="body-text">
                    There is no team here, and no reason to pretend there is. A message sent through this site reaches the person who will do the work.
                </p>

                @if (config('site.links.portfolio'))
                    <p class="mt-8">
                        <a
                            href="{{ config('site.links.portfolio') }}"
                            target="_blank"
                            rel="noopener"
                            class="link-line mono inline-flex items-center gap-2 text-[0.6875rem] uppercase tracking-[0.25em] text-[var(--accent-text)]"
                        >
                            View personal portfolio
                            <span class="arrow" aria-hidden="true">&rarr;</span>
                        </a>
                    </p>
                @endif

            </div>

        </div>

    </section>

    <div class="shell">
        <hr class="rule">
    </div>

    {{-- 6. Editorial commitment. The PRD is explicit that this is a
         differentiator and must not be buried. --}}
    <section id="editorial-commitment" class="shell section">

        <div class="grid gap-10 md:grid-cols-12 md:gap-8">

            <div class="md:col-span-4">
                <x-section-heading title="Editorial commitment" size="heading" />
            </div>

            <div class="md:col-span-8">

                <div class="measure reveal">

                    <p class="body-text">
                        Ralph de Vinca Perfumery will eventually sell a fragrance of its own. That creates a conflict worth naming before it exists, rather than after someone points it out.
                    </p>

                    <p class="body-text">
                        Honesty only means something when it costs something. Three rules apply without exception.
                    </p>

                </div>

                <ol class="mt-12 reveal">
                    @foreach ($rules as $rule)
                        <li class="grid gap-3 border-t border-line py-8 md:grid-cols-12 md:gap-8 @if ($loop->last) border-b @endif">
                            <span class="mono text-[0.6875rem] uppercase tracking-[0.25em] text-[var(--accent-text)] md:col-span-2">
                                {{ $rule['number'] }}
                            </span>
                            <div class="md:col-span-10">
                                <h3 class="heading-sm">{{ $rule['title'] }}</h3>
                                <p class="body-text muted measure mt-3">{{ $rule['body'] }}</p>
                            </div>
                        </li>
                    @endforeach
                </ol>

                <p class="body-text measure mt-12 reveal">
                    Discovery and education stay structurally separate from anything for sale. A visitor always knows which side of the line they are on.
                </p>

            </div>

        </div>

    </section>

</x-layout>
