<x-layout :title="'Page not found — '.config('site.name')" description="The page you were looking for does not exist.">

    <section class="shell section">

        <div class="measure py-10 md:py-20">

            <p class="eyebrow">404</p>

            <h1 class="display-l">This page doesn&rsquo;t exist.</h1>

            <p class="lede mt-8">
                The link may be wrong, or the page may have been moved.
            </p>

            <p class="mt-10">
                <a href="{{ route('home') }}" class="btn">
                    Back to home
                    <span class="arrow" aria-hidden="true">&rarr;</span>
                </a>
            </p>

        </div>

    </section>

</x-layout>
