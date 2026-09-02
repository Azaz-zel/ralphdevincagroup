<footer class="on-ink border-t border-line bg-ink text-paper">

    <div class="shell">

        <div class="grid gap-12 py-16 md:grid-cols-2 md:py-20 lg:grid-cols-4 lg:gap-8">

            <div class="lg:col-span-1">
                <p class="font-display text-xl leading-tight tracking-[-0.01em]">
                    {{ config('site.name') }}
                </p>
                <p class="mt-3 text-[0.9375rem] text-paper/72">
                    {{ config('site.tagline') }}
                </p>
                <p class="mt-1 text-[0.9375rem] text-paper/72">
                    {{ config('site.location') }}
                </p>
            </div>

            <div>
                <h2 class="label">Divisions</h2>
                <ul class="mt-5 flex flex-col gap-3">
                    @foreach (config('divisions') as $division)
                        <li>
                            <a href="{{ route($division['route']) }}" class="link-line text-[0.9375rem] text-paper/85 hover:text-paper">
                                {{ $division['short_name'] }}
                            </a>
                        </li>
                    @endforeach
                </ul>
            </div>

            <div>
                <h2 class="label">Site</h2>
                <ul class="mt-5 flex flex-col gap-3">
                    @foreach ([['about', 'About'], ['work', 'Work'], ['contact', 'Contact'], ['privacy', 'Privacy']] as [$name, $label])
                        <li>
                            <a href="{{ route($name) }}" class="link-line text-[0.9375rem] text-paper/85 hover:text-paper">
                                {{ $label }}
                            </a>
                        </li>
                    @endforeach
                </ul>
            </div>

            <div>
                <h2 class="label">Contact</h2>
                <ul class="mt-5 flex flex-col gap-3">
                    <li>
                        <a href="mailto:{{ config('site.email') }}" class="link-line break-words text-[0.9375rem] text-paper/85 hover:text-paper">
                            {{ config('site.email') }}
                        </a>
                    </li>
                </ul>
            </div>

        </div>

        <div class="border-t border-paper/14 py-6">
            <p class="font-mono text-[0.6875rem] uppercase tracking-[0.25em] text-paper/62">
                &copy; {{ date('Y') }} {{ config('site.name') }}. Built in Bali.
            </p>
        </div>

    </div>

</footer>
