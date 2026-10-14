@use('Illuminate\Support\Facades\Crypt')

<x-layout>

    <section class="shell section-open">

        <div class="grid gap-10 lg:grid-cols-12 lg:gap-16">

            <div class="measure lg:col-span-8">
                <h1 class="display-xl">Start a project.</h1>
                <p class="lede">
                    Tell me what the problem is, rather than what you think the solution should be. The problem is usually the more useful half.
                </p>
            </div>

            {{-- Kept beside the title rather than below the form: someone who
                 would rather write an email themselves should not have to
                 scroll past a form to find the address. --}}
            <dl class="lg:col-span-4 lg:pt-3">
                <div>
                    <dt class="label">Location</dt>
                    <dd class="small m-0 mt-2">{{ config('site.location') }}</dd>
                </div>
                <div class="mt-7">
                    <dt class="label">Email</dt>
                    <dd class="small m-0 mt-2">
                        <a href="mailto:{{ config('site.email') }}" class="link-inline break-words">{{ config('site.email') }}</a>
                    </dd>
                </div>
            </dl>

        </div>

    </section>

    <section class="shell section-tight">

        <div class="grid gap-14 pt-6 lg:grid-cols-12 lg:gap-16">

            {{-- What happens after the message is sent. --}}
            <div class="lg:col-span-5">

                <div class="measure-narrow">

                    <p class="body-text">
                        <strong>What I take on:</strong> websites for businesses, internal systems, and platforms that need their data organised properly.
                    </p>

                    <p class="body-text">
                        <strong>What I don&rsquo;t:</strong> anything I can&rsquo;t do well. I&rsquo;ll say so directly rather than take the work.
                    </p>

                    <p class="body-text">
                        Messages arrive with me, not with a team. You&rsquo;ll get a reply within two working days, and it will be an actual answer rather than a link to book a call.
                    </p>

                </div>

            </div>

            {{-- The one form on the site. --}}
            <div class="lg:col-span-7">

                <div id="form" class="card glass p-6 md:p-10">

                    @if (session('status') === 'sent')
                        <div role="status" class="notice mb-8">
                            <p class="body-text m-0">
                                <strong>Message sent.</strong> You&rsquo;ll get a reply within two working days.
                            </p>
                        </div>
                    @endif

                    @if (session('status') === 'failed')
                        <div role="alert" class="notice notice-error mb-8">
                            <p class="body-text m-0">
                                The message couldn&rsquo;t be sent. Try again in a moment, or email
                                <a href="mailto:{{ config('site.email') }}" class="link-inline">{{ config('site.email') }}</a>
                                directly.
                            </p>
                        </div>
                    @endif

                    <form method="POST" action="{{ route('contact.store') }}" novalidate>

                        @csrf

                        {{-- Hidden with CSS rather than type="hidden", so a bot
                             filling every field it can see gives itself away. --}}
                        <div class="honeypot" aria-hidden="true">
                            <label for="company_website">Company website</label>
                            <input
                                type="text"
                                id="company_website"
                                name="company_website"
                                tabindex="-1"
                                autocomplete="off"
                                value="{{ old('company_website') }}"
                            >
                        </div>

                        {{-- Encrypted render time. The controller rejects
                             anything submitted within three seconds of it. --}}
                        <input type="hidden" name="form_rendered_at" value="{{ Crypt::encryptString((string) now()->timestamp) }}">

                        <div class="flex flex-col gap-7">

                            <div>
                                <label for="name" class="field-label">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value="{{ old('name') }}"
                                    autocomplete="name"
                                    required
                                    class="field @error('name') field-error @enderror"
                                    @error('name') aria-invalid="true" aria-describedby="name-error" @enderror
                                >
                                @error('name')
                                    <p id="name-error" class="error-text">{{ $message }}</p>
                                @enderror
                            </div>

                            <div>
                                <label for="email" class="field-label">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value="{{ old('email') }}"
                                    autocomplete="email"
                                    required
                                    class="field @error('email') field-error @enderror"
                                    @error('email') aria-invalid="true" aria-describedby="email-error" @enderror
                                >
                                @error('email')
                                    <p id="email-error" class="error-text">{{ $message }}</p>
                                @enderror
                            </div>

                            <div>
                                <label for="division" class="field-label">Which division?</label>
                                <select
                                    id="division"
                                    name="division"
                                    class="field @error('division') field-error @enderror"
                                    @error('division') aria-invalid="true" aria-describedby="division-error" @enderror
                                >
                                    <option value="unsure" @selected(old('division', 'unsure') === 'unsure')>Not sure</option>
                                    <option value="technology" @selected(old('division') === 'technology')>Technology</option>
                                    <option value="perfumery" @selected(old('division') === 'perfumery')>Perfumery</option>
                                </select>
                                @error('division')
                                    <p id="division-error" class="error-text">{{ $message }}</p>
                                @enderror
                            </div>

                            <div>
                                <label for="message" class="field-label">Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows="6"
                                    required
                                    placeholder="What are you trying to build, or what's currently getting in the way?"
                                    class="field @error('message') field-error @enderror"
                                    @error('message') aria-invalid="true" aria-describedby="message-error" @enderror
                                >{{ old('message') }}</textarea>
                                @error('message')
                                    <p id="message-error" class="error-text">{{ $message }}</p>
                                @enderror
                            </div>

                            <div>
                                <button type="submit" class="btn">Send message</button>
                            </div>

                        </div>

                    </form>

                </div>

                <p class="small muted mt-6">
                    Your name, email, and message are stored so they can be replied to. Nothing else is done with them.
                    <a href="{{ route('privacy') }}" class="link-inline">Privacy</a>
                </p>

            </div>

        </div>

    </section>

</x-layout>
