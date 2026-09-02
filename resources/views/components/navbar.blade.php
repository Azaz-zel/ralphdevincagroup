@php
    $links = [
        ['route' => 'about', 'label' => 'About'],
        ['route' => 'perfumery', 'label' => 'Perfumery'],
        ['route' => 'technology', 'label' => 'Technology'],
        ['route' => 'work', 'label' => 'Work'],
        ['route' => 'contact', 'label' => 'Contact'],
    ];

    $current = request()->route()?->getName();
@endphp

{{-- Opaque rather than translucent-and-blurred: a backdrop-filter on a
     sticky element repaints the strip behind it on every scroll frame, and the
     cost grows with viewport width, which is why it was felt on desktop and
     not on a phone. On a paper-coloured page the two look the same. --}}
<header class="sticky top-0 z-50 border-b border-line bg-paper">

    <div class="shell">

        <div class="flex items-center justify-between gap-6 py-4 md:py-5">

            <a href="{{ route('home') }}" class="shrink-0" @if ($current === 'home') aria-current="page" @endif>
                <span class="sr-only">{{ config('site.name') }} — home</span>
                <span aria-hidden="true" class="block font-display text-xl leading-none tracking-[-0.02em] md:text-2xl">
                    {{ config('site.wordmark') }}
                </span>
                <span aria-hidden="true" class="mt-1 block font-mono text-[0.5625rem] uppercase leading-none tracking-[0.35em] text-stone">
                    {{ config('site.wordmark_line') }}
                </span>
            </a>

            <nav aria-label="Primary" class="hidden md:block">
                <ul class="flex items-center gap-8">
                    @foreach ($links as $link)
                        <li>
                            <a
                                href="{{ route($link['route']) }}"
                                class="link-line text-[0.9375rem] {{ $current === $link['route'] ? 'text-ink' : 'text-stone hover:text-ink' }}"
                                @if ($current === $link['route']) aria-current="page" @endif
                            >{{ $link['label'] }}</a>
                        </li>
                    @endforeach
                </ul>
            </nav>

            <button
                type="button"
                data-nav-toggle
                aria-expanded="false"
                aria-controls="mobile-nav"
                class="-mr-2 inline-flex items-center gap-2 p-2 font-mono text-[0.6875rem] uppercase tracking-[0.25em] text-ink md:hidden"
            >
                Menu
                <span aria-hidden="true" class="flex flex-col gap-[3px]">
                    <span class="block h-px w-4 bg-ink"></span>
                    <span class="block h-px w-4 bg-ink"></span>
                </span>
            </button>

        </div>

    </div>

    <nav id="mobile-nav" data-nav-panel hidden aria-label="Primary, mobile" class="border-t border-line md:hidden">
        <ul class="shell flex flex-col py-2">
            @foreach ($links as $link)
                <li class="border-b border-line last:border-b-0">
                    <a
                        href="{{ route($link['route']) }}"
                        class="block py-4 text-[1.0625rem] {{ $current === $link['route'] ? 'text-ink' : 'text-stone' }}"
                        @if ($current === $link['route']) aria-current="page" @endif
                    >{{ $link['label'] }}</a>
                </li>
            @endforeach
        </ul>
    </nav>

</header>
