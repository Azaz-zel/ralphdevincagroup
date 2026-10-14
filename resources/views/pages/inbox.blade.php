@php
    $filters = [
        ['value' => null, 'label' => 'All', 'count' => $total],
        ['value' => 'new', 'label' => 'New', 'count' => (int) $counts->get('new', 0)],
        ['value' => 'read', 'label' => 'Read', 'count' => (int) $counts->get('read', 0)],
        ['value' => 'replied', 'label' => 'Replied', 'count' => (int) $counts->get('replied', 0)],
        ['value' => 'archived', 'label' => 'Archived', 'count' => (int) $counts->get('archived', 0)],
    ];
@endphp

<x-layout :title="'Inbox | '.config('site.name')" description="Messages sent through this site." admin>

    <section class="shell pt-12 pb-20 md:pt-16">

        <div class="flex flex-wrap items-start justify-between gap-6">

            <div>
                <h1 class="display-l">
                    {{ $newCount > 0 ? $newCount.' new '.Str::plural('message', $newCount) : 'No new messages' }}
                </h1>
            </div>

        </div>

        @if (session('status'))
            <p role="status" class="notice mt-8">
                {{ session('status') }}
            </p>
        @endif

        {{-- Search and filters. Both are plain GET, so any view of the inbox
             can be bookmarked and survives a reload. --}}
        <div class="mt-10 flex flex-col gap-5 border-t border-line pt-6 lg:flex-row lg:items-center lg:justify-between">

            <nav aria-label="Filter by status" class="flex flex-wrap gap-x-6 gap-y-3">
                @foreach ($filters as $item)
                    <a
                        href="{{ route('inbox', array_filter(['status' => $item['value'], 'q' => $search])) }}"
                        class="mono text-[0.6875rem] uppercase tracking-[0.25em] {{ $filter === $item['value'] ? 'text-ink' : 'text-stone hover:text-ink' }}"
                        @if ($filter === $item['value']) aria-current="true" @endif
                    >{{ $item['label'] }} <span class="text-stone">({{ $item['count'] }})</span></a>
                @endforeach
            </nav>

            <form method="GET" action="{{ route('inbox') }}" class="flex w-full items-center gap-3 lg:w-auto">
                @if ($filter)
                    <input type="hidden" name="status" value="{{ $filter }}">
                @endif
                <label for="q" class="sr-only">Search messages</label>
                <input
                    type="search"
                    id="q"
                    name="q"
                    value="{{ $search }}"
                    placeholder="Search name, email, or message"
                    class="field w-full py-2.5 text-[0.9375rem] lg:w-72"
                >
                <button type="submit" class="btn btn-quiet shrink-0 px-5 py-2.5 text-[0.8125rem]">Search</button>
            </form>

        </div>

        @if ($search !== null && $search !== '')
            <p class="small muted mt-5">
                {{ $inquiries->total() }} {{ Str::plural('result', $inquiries->total()) }} for &ldquo;{{ $search }}&rdquo;.
                <a href="{{ route('inbox', array_filter(['status' => $filter])) }}" class="link-inline">Clear search</a>
            </p>
        @endif

        <div class="mt-2">

            @forelse ($inquiries as $inquiry)
                @php
                    $isNew = $inquiry->status === 'new';
                    $isArchived = $inquiry->status === 'archived';
                @endphp

                {{-- The row is a container, not a link: it holds one link and
                     real buttons, and a link may not contain a button. The
                     title link is stretched over the row instead. --}}
                <div class="row-link group/row relative border-t border-line py-4 transition-colors hover:border-[var(--accent)] {{ $loop->last ? 'border-b' : '' }}">

                    <div class="flex flex-col gap-2 lg:flex-row lg:items-baseline lg:gap-6">

                        <div class="flex min-w-0 items-baseline gap-3 lg:w-72 lg:shrink-0">
                            {{-- Unread is marked by a shape as well as a
                                 colour, so it never depends on colour alone. --}}
                            <span class="mt-1 size-2 shrink-0 rounded-full {{ $isNew ? 'bg-[var(--accent)]' : 'bg-transparent' }}" aria-hidden="true"></span>
                            <span class="min-w-0">
                                <a href="{{ route('inbox.show', $inquiry) }}" class="row-target {{ $isNew ? 'heading-sm' : 'small' }} block truncate">
                                    @if ($isNew)<span class="sr-only">Unread. </span>@endif
                                    {{ $inquiry->name }}
                                </a>
                                <span class="small muted block truncate">{{ $inquiry->email }}</span>
                            </span>
                        </div>

                        <p class="small muted m-0 line-clamp-1 min-w-0 grow">{{ $inquiry->message }}</p>

                        <div class="flex shrink-0 items-center gap-4">
                            <span class="mono text-[0.6875rem] uppercase tracking-[0.25em] text-stone">{{ $inquiry->divisionLabel() }}</span>
                            <span class="small muted whitespace-nowrap" title="{{ $inquiry->created_at->format('j F Y, H:i') }}">
                                {{ $inquiry->created_at->diffForHumans(short: true) }}
                            </span>
                        </div>

                    </div>

                    {{-- Above the stretched link, so these stay clickable. --}}
                    <div class="relative z-1 mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 lg:ml-78">

                        <span class="mono text-[0.625rem] uppercase tracking-[0.25em] {{ $isNew ? 'text-[var(--accent-text)]' : 'text-stone' }}">
                            {{ $inquiry->status }}
                        </span>

                        @if ($inquiry->status !== 'replied')
                            <form method="POST" action="{{ route('inbox.update', $inquiry) }}">
                                @csrf @method('PATCH')
                                <input type="hidden" name="status" value="replied">
                                <button type="submit" class="link-line small text-stone hover:text-ink">Mark replied</button>
                            </form>
                        @endif

                        @if (! $isNew)
                            <form method="POST" action="{{ route('inbox.update', $inquiry) }}">
                                @csrf @method('PATCH')
                                <input type="hidden" name="status" value="new">
                                <button type="submit" class="link-line small text-stone hover:text-ink">Mark unread</button>
                            </form>
                        @endif

                        @if (! $isArchived)
                            <form method="POST" action="{{ route('inbox.update', $inquiry) }}">
                                @csrf @method('PATCH')
                                <input type="hidden" name="status" value="archived">
                                <button type="submit" class="link-line small text-stone hover:text-ink">Archive</button>
                            </form>
                        @endif

                    </div>

                </div>
            @empty
                <p class="body-text muted border-t border-line py-12">
                    @if ($search !== null && $search !== '')
                        Nothing matches &ldquo;{{ $search }}&rdquo;{{ $filter ? ' in '.$filter : '' }}.
                    @elseif ($filter)
                        No {{ $filter }} messages.
                    @else
                        No messages yet. Anything sent through the contact form arrives here.
                    @endif
                </p>
            @endforelse

        </div>

        @if ($inquiries->hasPages())
            <div class="mt-10">
                {{ $inquiries->links() }}
            </div>
        @endif

    </section>

</x-layout>
