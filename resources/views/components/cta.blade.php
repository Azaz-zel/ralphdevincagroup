@props([
    'heading' => null,
    'body' => null,
    'label' => 'Start a project',
    'to' => 'contact',
])

@php
    // What happens after someone writes. Every line restates something the
    // contact, technology and about pages already promise; nothing new is claimed.
    $next = [
        ['title' => 'A reply within two working days.', 'body' => 'An actual answer, rather than a link to book a call.'],
        ['title' => 'Scope and cost in writing.', 'body' => 'What will be built, what will not, and what it costs, before anything begins.'],
        ['title' => 'One person, start to finish.', 'body' => 'The message reaches the person who will do the work.'],
    ];
@endphp

{{--
    The closing block. It never carries a form: there is one form on the site,
    and it lives on the contact page. The two lights meet behind the glass.
--}}

<section {{ $attributes->merge(['class' => 'shell section']) }}>

    <div class="glow glow-brass glow-drift" style="width: 46rem; height: 46rem; left: 4%; top: -6rem" aria-hidden="true"></div>
    <div class="glow glow-vinca glow-drift-slow" style="width: 42rem; height: 42rem; right: 2%; top: 2rem" aria-hidden="true"></div>

    <div class="close-panel glass reveal">

        <div class="flex flex-col items-start gap-7">

            @if ($heading)
                {{-- Unescaped so a view can italicise one word. Only ever a literal
                     written in a Blade view, never anything stored or submitted. --}}
                <h2 class="display-l max-w-[14ch]">{!! $heading !!}</h2>
            @endif

            @if ($body)
                {{-- The column's gap sets this spacing; the title rule's own margin would double it. --}}
                <p class="lede measure-narrow mt-0">{{ $body }}</p>
            @endif

            {{ $slot }}

            <div class="mt-2 flex flex-wrap items-center gap-x-7 gap-y-3">
                <a href="{{ route($to) }}" class="btn">
                    {{ $label }}
                    <span class="arrow" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 256 256"><path d="M40 128h176M144 56l72 72-72 72" fill="none" stroke="currentColor" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
                </a>
                <a href="mailto:{{ config('site.email') }}" class="link-inline inline-flex min-h-11 items-center text-[0.9375rem] text-text-2">{{ config('site.email') }}</a>
            </div>

        </div>

        <div class="close-next">
            <h3 class="label">After you write</h3>
            <ol class="mt-2">
                @foreach ($next as $step)
                    <li class="close-step">
                        <span class="close-step-title">{{ $step['title'] }}</span>
                        <span class="body-text small">{{ $step['body'] }}</span>
                    </li>
                @endforeach
            </ol>
        </div>

    </div>

</section>
