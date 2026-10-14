@use('App\Support\Screenshots')

<x-layout :title="'Projects | '.config('site.name')" description="Add and edit the case studies shown on this site." admin>

    <section class="shell pt-12 pb-24 md:pt-16">

        <div class="flex flex-wrap items-end justify-between gap-6">
            <div class="flex flex-col gap-3">
                <h1 class="display-l">Projects</h1>
                <p class="body-text">Shown on the site in this order. The count on the home page follows on its own.</p>
            </div>
            <a href="{{ route('projects.create') }}" class="btn">
                <svg width="16" height="16" viewBox="0 0 256 256" aria-hidden="true"><path d="M128 40v176M40 128h176" fill="none" stroke="currentColor" stroke-width="18" stroke-linecap="round"/></svg>
                New project
            </a>
        </div>

        @if (session('status'))
            <p role="status" class="notice mt-8">{{ session('status') }}</p>
        @endif

        @if ($projects->isEmpty())
            <div class="glass mt-8 flex flex-col items-start gap-5 rounded-[28px] px-7 py-14 md:px-12">
                <h2 class="heading">No projects yet.</h2>
                <p class="body-text measure-narrow">The Work section on the site stays hidden until the first project is added. Add one with its story, its decisions and at least one screenshot.</p>
                <a href="{{ route('projects.create') }}" class="btn">Add the first project</a>
            </div>
        @else
            <div class="glass mt-8 overflow-x-auto rounded-[28px] p-2">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th scope="col">No.</th>
                            <th scope="col">Project</th>
                            <th scope="col">Division</th>
                            <th scope="col">Screenshots</th>
                            <th scope="col"><span class="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($projects as $project)
                            @php($cover = $project->coverImage())
                            <tr>
                                <td class="mono text-[0.8125rem] text-stone tabular-nums">{{ str_pad((string) $loop->iteration, 2, '0', STR_PAD_LEFT) }}</td>
                                <td>
                                    <span class="flex items-center gap-4">
                                        @if ($cover)
                                            <img
                                                src="{{ asset(Screenshots::path($cover['file'], $cover['uploaded'] ?? false, '-800w.jpg')) }}"
                                                alt=""
                                                width="88"
                                                height="44"
                                                loading="lazy"
                                                class="shot-thumb w-[5.5rem] shrink-0"
                                            >
                                        @endif
                                        <span class="flex min-w-0 flex-col">
                                            <a href="{{ route('projects.edit', $project) }}" class="font-medium hover:underline">{{ $project->name }}</a>
                                            <span class="mono text-xs text-stone">/work/{{ $project->slug }}</span>
                                        </span>
                                    </span>
                                </td>
                                <td><span class="chip chip-{{ $project->accent() }}">{{ $project->divisionLabel() }}</span></td>
                                <td class="mono text-[0.8125rem] tabular-nums">{{ count($project->images ?? []) }}</td>
                                <td>
                                    <span class="flex items-center justify-end gap-1">
                                        <a href="{{ route('projects.edit', $project) }}" class="row-action">Edit<span class="sr-only"> {{ $project->name }}</span></a>
                                        <a href="{{ route('work.show', $project) }}" class="row-action">View<span class="sr-only"> {{ $project->name }} on the site</span></a>
                                        <details class="confirm">
                                            <summary class="row-action row-action-danger">Delete<span class="sr-only"> {{ $project->name }}</span></summary>
                                            <div class="confirm-panel">
                                                <p class="small">Delete <strong>{{ $project->name }}</strong>? Its case study and the screenshots uploaded for it are removed. This cannot be undone.</p>
                                                <form method="POST" action="{{ route('projects.destroy', $project) }}" class="mt-4">
                                                    @csrf
                                                    @method('DELETE')
                                                    <button type="submit" class="btn btn-danger btn-sm w-full">Delete project</button>
                                                </form>
                                            </div>
                                        </details>
                                    </span>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif

    </section>

</x-layout>
