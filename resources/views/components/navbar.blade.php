@props([
    'admin' => false,
])

@php
    $links = $admin
        ? [
            ['route' => 'inbox', 'label' => 'Inbox', 'active' => 'inbox*'],
            ['route' => 'projects.index', 'label' => 'Projects', 'active' => 'projects.*'],
        ]
        : [
            ['route' => 'about', 'label' => 'About', 'active' => 'about'],
            ['route' => 'perfumery', 'label' => 'Perfumery', 'active' => 'perfumery'],
            ['route' => 'technology', 'label' => 'Technology', 'active' => 'technology'],
            ['route' => 'work', 'label' => 'Work', 'active' => 'work*'],
            ['route' => 'contact', 'label' => 'Contact', 'active' => 'contact'],
        ];
@endphp

{{-- A floating pill of glass that stays at the top while the page scrolls. The
     blur samples only the strip behind the pill, not the full width. --}}
<header class="site-nav shell">

    <div class="nav-bar glass">

        <a href="{{ route('home') }}" class="flex min-h-11 shrink-0 flex-col justify-center" @if (request()->routeIs('home')) aria-current="page" @endif>
            <span class="sr-only">{{ config('site.name') }}, home</span>
            <span aria-hidden="true" class="block font-display text-[1.375rem] leading-none tracking-[-0.02em]">
                {{ config('site.wordmark') }}
            </span>
            <span aria-hidden="true" class="mt-1 block font-mono text-[0.5625rem] uppercase leading-none tracking-[0.35em] text-stone">
                {{ $admin ? 'ADMIN' : config('site.wordmark_line') }}
            </span>
        </a>

        {{-- Links sit at the right, beside the controls, rather than floating in
             the middle of the pill. --}}
        <div class="flex items-center gap-2">

            <nav aria-label="{{ $admin ? 'Admin' : 'Primary' }}" class="hidden lg:block">
                <ul class="flex items-center gap-0.5">
                    @foreach ($links as $link)
                        <li>
                            <a
                                href="{{ route($link['route']) }}"
                                class="nav-link"
                                @if (request()->routeIs($link['active'])) aria-current="page" @endif
                            >{{ $link['label'] }}</a>
                        </li>
                    @endforeach
                </ul>
            </nav>

            @if ($admin)
                <form method="POST" action="{{ route('logout') }}" class="hidden lg:block">
                    @csrf
                    <button type="submit" class="btn btn-quiet btn-sm">Sign out</button>
                </form>
            @endif

            <button
                type="button"
                data-nav-toggle
                aria-expanded="false"
                aria-controls="mobile-nav"
                class="menu-button lg:hidden"
            >
                Menu
                <svg width="16" height="16" viewBox="0 0 256 256" aria-hidden="true"><path d="M40 104h176M40 152h176" fill="none" stroke="currentColor" stroke-width="16" stroke-linecap="round"/></svg>
            </button>

        </div>

    </div>

    <nav id="mobile-nav" data-nav-panel hidden aria-label="{{ $admin ? 'Admin, mobile' : 'Primary, mobile' }}" class="menu-panel glass lg:hidden">
        <ul>
            @foreach ($links as $link)
                <li>
                    <a
                        href="{{ route($link['route']) }}"
                        @if (request()->routeIs($link['active'])) aria-current="page" @endif
                    >{{ $link['label'] }}</a>
                </li>
            @endforeach
        </ul>

        @if ($admin)
            <form method="POST" action="{{ route('logout') }}" class="px-2 pt-2 pb-1">
                @csrf
                <button type="submit" class="btn btn-quiet btn-sm w-full">Sign out</button>
            </form>
        @endif
    </nav>

</header>
