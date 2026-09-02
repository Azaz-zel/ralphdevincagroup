<x-layout :title="'Too many messages — '.config('site.name')" description="The contact form has a rate limit to keep automated submissions out.">

    <section class="shell section">

        <div class="measure py-10 md:py-20">

            <p class="eyebrow">429</p>

            <h1 class="display-l">Too many messages.</h1>

            <p class="lede mt-8">
                Too many messages sent from here. Try again in an hour.
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
