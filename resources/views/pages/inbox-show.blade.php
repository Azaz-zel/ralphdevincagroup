<x-layout :title="'Message from '.$inquiry->name.' | '.config('site.name')" description="A message sent through this site." admin>

    <section class="shell section">

        <div class="measure">

            <a href="{{ route('inbox') }}" class="link-line mono inline-flex items-center gap-2 text-[0.6875rem] uppercase tracking-[0.25em] text-stone">
                <span aria-hidden="true" class="arrow rotate-180"><svg width="14" height="14" viewBox="0 0 256 256"><path d="M40 128h176M144 56l72 72-72 72" fill="none" stroke="currentColor" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
                Inbox
            </a>

            @if (session('status'))
                <p role="status" class="notice mt-8">
                    {{ session('status') }}
                </p>
            @endif

            <h1 class="display-l mt-8">{{ $inquiry->name }}</h1>

            <p class="mt-4">
                <a href="mailto:{{ $inquiry->email }}" class="link-inline">{{ $inquiry->email }}</a>
            </p>

            <dl class="mt-10 grid gap-6 border-y border-line py-6 sm:grid-cols-3">
                <div>
                    <dt class="label">Division</dt>
                    <dd class="small m-0 mt-2">{{ $inquiry->divisionLabel() }}</dd>
                </div>
                <div>
                    <dt class="label">Status</dt>
                    <dd class="small m-0 mt-2">{{ $inquiry->status }}</dd>
                </div>
                <div>
                    <dt class="label">Arrived</dt>
                    <dd class="small m-0 mt-2" title="{{ $inquiry->created_at->format('j F Y, H:i') }}">
                        {{ $inquiry->created_at->format('j F Y, H:i') }}
                    </dd>
                </div>
            </dl>

            {{-- Escaped, and line breaks preserved by CSS rather than markup.
                 This text arrived from the public internet. --}}
            <div class="body-text mt-10 whitespace-pre-line">{{ $inquiry->message }}</div>

            <div class="mt-12 flex flex-wrap items-center gap-4 border-t border-line pt-8">

                <a
                    href="mailto:{{ $inquiry->email }}?subject={{ rawurlencode('Re: your message to '.config('site.name')) }}"
                    class="btn"
                >
                    Reply by email
                </a>

                @if ($inquiry->status !== 'replied')
                    <form method="POST" action="{{ route('inbox.update', $inquiry) }}">
                        @csrf
                        @method('PATCH')
                        <input type="hidden" name="status" value="replied">
                        <button type="submit" class="btn btn-quiet">Mark as replied</button>
                    </form>
                @endif

                {{-- Opening a message marks it read, so there has to be a way
                     back for one opened by accident. --}}
                <form method="POST" action="{{ route('inbox.update', $inquiry) }}">
                    @csrf
                    @method('PATCH')
                    <input type="hidden" name="status" value="new">
                    <button type="submit" class="btn btn-quiet">Mark unread</button>
                </form>

                @if ($inquiry->status !== 'archived')
                    <form method="POST" action="{{ route('inbox.update', $inquiry) }}">
                        @csrf
                        @method('PATCH')
                        <input type="hidden" name="status" value="archived">
                        <button type="submit" class="btn btn-quiet">Archive</button>
                    </form>
                @endif

            </div>

            {{-- Replying happens in a real mail client. Building a reply box
                 here would be a lot of work for very little at this volume. --}}
            <dl class="mt-12 border-t border-line pt-8">
                @if ($inquiry->read_at)
                    <div class="flex flex-wrap gap-x-4">
                        <dt class="label">First read</dt>
                        <dd class="small muted m-0">{{ $inquiry->read_at->format('j F Y, H:i') }}</dd>
                    </div>
                @endif
                @if ($inquiry->replied_at)
                    <div class="mt-3 flex flex-wrap gap-x-4">
                        <dt class="label">Replied</dt>
                        <dd class="small muted m-0">{{ $inquiry->replied_at->format('j F Y, H:i') }}</dd>
                    </div>
                @endif
                <div class="mt-3 flex flex-wrap gap-x-4">
                    <dt class="label">IP address</dt>
                    <dd class="small muted m-0">{{ $inquiry->ip_address ?? 'Not recorded' }}</dd>
                </div>
                <div class="mt-3 flex flex-wrap gap-x-4">
                    <dt class="label">User agent</dt>
                    <dd class="small muted measure m-0 break-words">{{ $inquiry->user_agent ?? 'Not recorded' }}</dd>
                </div>
            </dl>

        </div>

    </section>

</x-layout>
