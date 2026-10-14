@props([
    'admin' => false,
])

<footer class="border-t border-line">

    <div class="shell">

        @unless ($admin)
            <div class="grid gap-12 py-16 md:grid-cols-2 md:py-20 lg:grid-cols-4 lg:gap-8">

                <div>
                    <p class="font-display text-2xl leading-tight tracking-[-0.01em]">
                        {{ config('site.name') }}
                    </p>
                    <p class="body-text mt-3">{{ config('site.tagline') }}</p>
                    <p class="body-text">{{ config('site.location') }}</p>
                </div>

                <div>
                    <h2 class="label">Divisions</h2>
                    <ul class="mt-4 flex flex-col">
                        @foreach (config('divisions') as $division)
                            <li>
                                <a href="{{ route($division['route']) }}" class="link-line inline-flex min-h-11 items-center text-[0.9375rem] text-text-2 hover:text-ink">
                                    {{ $division['short_name'] }}
                                </a>
                            </li>
                        @endforeach
                    </ul>
                </div>

                <div>
                    <h2 class="label">Site</h2>
                    <ul class="mt-4 flex flex-col">
                        @foreach ([['about', 'About'], ['work', 'Work'], ['contact', 'Contact'], ['privacy', 'Privacy']] as [$name, $label])
                            <li>
                                <a href="{{ route($name) }}" class="link-line inline-flex min-h-11 items-center text-[0.9375rem] text-text-2 hover:text-ink">
                                    {{ $label }}
                                </a>
                            </li>
                        @endforeach
                    </ul>
                </div>

                <div>
                    <h2 class="label">Contact</h2>
                    <ul class="mt-4 flex flex-col">
                        <li>
                            <a href="mailto:{{ config('site.email') }}" class="link-line inline-flex min-h-11 items-center break-all text-[0.9375rem] text-text-2 hover:text-ink">
                                {{ config('site.email') }}
                            </a>
                        </li>
                    </ul>
                </div>

            </div>
        @endunless

        <div class="flex flex-wrap items-center justify-between gap-4 border-t border-line py-6">
            <p class="label">&copy; {{ date('Y') }} {{ config('site.name') }}. Built in Bali.</p>
            @if ($admin)
                <a href="{{ route('home') }}" class="label link-line">View the site</a>
            @endif
        </div>

    </div>

</footer>
