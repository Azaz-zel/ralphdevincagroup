@use('Illuminate\Support\Number')
@use('Illuminate\Support\Str')

<x-layout :description="$metaDescription ?? null">

    <section class="shell section">
        <div class="measure">
            <p class="eyebrow">Work</p>
            <h1 class="display-xl">Everything built so far.</h1>
            <p class="lede">
                {{ Str::ucfirst(Number::spell(count($projects ?? config('projects')))) }} projects. All of them are here &mdash; this is not a selection.
            </p>
        </div>
    </section>

    {{-- No filters and no tabs. Filtering three items only makes a site feel
         emptier than it is. --}}
    <section class="shell section-tight">
        @foreach ($projects ?? config('projects') as $project)
            <x-work-row :project="$project" level="h2" />
        @endforeach
    </section>

    <x-cta
        heading="Have something that needs building?"
        body="Tell me what the problem is. If it isn't a good fit, I'll say so."
        label="Start a project"
    />

</x-layout>
