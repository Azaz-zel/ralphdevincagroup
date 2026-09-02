@props([
    'heading' => null,
    'body' => null,
    'label' => 'Start a project',
    'to' => 'contact',
])

{{--
    The closing block. It never carries a form: there is one form on the site,
    and it lives on the contact page.
--}}

<section {{ $attributes->merge(['class' => 'on-ink bg-ink text-paper']) }}>

    <div class="shell section">

        <div class="reveal measure">

            @if ($heading)
                <h2 class="display-l">{{ $heading }}</h2>
            @endif

            @if ($body)
                <p class="lede mt-6">{{ $body }}</p>
            @endif

            {{ $slot }}

            <p class="mt-10">
                <a href="{{ route($to) }}" class="btn">
                    {{ $label }}
                    <span class="arrow" aria-hidden="true">&rarr;</span>
                </a>
            </p>

        </div>

    </div>

</section>
