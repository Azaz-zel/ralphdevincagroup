@php
    $email = config('site.email');
@endphp

<x-layout>

    <section class="shell section">
        <div class="measure">
            <p class="eyebrow">Privacy</p>
            <h1 class="display-xl">What happens to your information.</h1>
            <p class="lede">
                This page covers the only information this site collects.
            </p>
        </div>
    </section>

    <section class="shell section-tight">

        <div class="measure border-t border-line pt-12">

            <div class="reveal">
                <h2 class="heading">What is collected</h2>
                <p class="body-text mt-4">
                    When you send a message through the contact form: your name, your email address, your message, the division you selected, and the IP address the message was sent from.
                </p>
            </div>

            <div class="reveal mt-12">
                <h2 class="heading">Why</h2>
                <p class="body-text mt-4">
                    Your name, email, and message exist so the message can be answered. The IP address is kept only to identify automated abuse of the form.
                </p>
            </div>

            <div class="reveal mt-12">
                <h2 class="heading">What is not done</h2>
                <p class="body-text mt-4">
                    Nothing is sold, shared, or passed to advertisers. There is no analytics tracking, no advertising pixel, and no third-party script watching what you do on this site.
                </p>
            </div>

            <div class="reveal mt-12">
                <h2 class="heading">How long it is kept</h2>
                <p class="body-text mt-4">
                    Messages are kept while the conversation is useful, and deleted on request.
                </p>
            </div>

            <div class="reveal mt-12">
                <h2 class="heading">Your choices</h2>
                <p class="body-text mt-4">
                    Write to <a href="mailto:{{ $email }}" class="link-inline">{{ $email }}</a> to ask what is held about you, to correct it, or to have it deleted. Requests are answered within seven days.
                </p>
            </div>

            <div class="reveal mt-12">
                <h2 class="heading">Cookies</h2>
                <p class="body-text mt-4">
                    This site sets one session cookie, required for the contact form to work securely. No tracking cookies are used.
                </p>
            </div>

            <p class="label mt-16">Last updated: {{ config('site.privacy_updated') }}</p>

        </div>

    </section>

</x-layout>
