@use('Illuminate\Support\Number')
@use('Illuminate\Support\Str')

<x-layout :description="$metaDescription ?? null">

    <section class="shell section-open">
        <div class="glow glow-brass glow-drift" style="width: 52rem; height: 52rem; right: -18rem; top: -16rem" aria-hidden="true"></div>
        <div class="measure">
            <h1 class="display-xl">Everything built so far.</h1>
            <p class="lede">
                @if ($projects->isEmpty())
                    Nothing is listed yet. The first case study is being written.
                @else
                    {{ Str::ucfirst(Number::spell($projects->count())) }} {{ Str::plural('project', $projects->count()) }}. All of them are here; this is not a selection.
                @endif
            </p>
        </div>
    </section>

    {{-- No filters and no tabs. Filtering three items only makes a site feel
         emptier than it is. --}}
    @if ($projects->isNotEmpty())
        <section class="shell section">
            <x-work-list :projects="$projects" level="h2" />
        </section>
    @endif

    <x-cta
        heading="Have something that needs <em>building?</em>"
        body="Tell me what the problem is. If it isn't a good fit, I'll say so."
        label="Start a project"
    />

</x-layout>
