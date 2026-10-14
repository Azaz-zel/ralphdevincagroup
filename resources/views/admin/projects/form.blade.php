@use('App\Support\Screenshots')

@php
    $editing = $project->exists;
    $action = $editing ? route('projects.update', $project) : route('projects.store');

    // After a failed save the form shows what was typed, not what is stored.
    $facts = old('facts', $project->facts ?? []);
    $decisions = old('decisions', $project->decisions ?? []);
    $stored = collect($project->images ?? [])->keyBy('file');
    $images = collect(old('images', $project->images ?? []))
        ->filter(fn ($image) => is_array($image) && isset($stored[$image['file'] ?? null]))
        ->map(fn ($image) => array_merge($stored[$image['file']], ['alt' => $image['alt'] ?? '']))
        ->values();
    $coverFile = $project->coverImage()['file'] ?? null;
    $cover = old('cover', $coverFile ? 'existing:'.$coverFile : 'new:0');

    $field = fn (string $name) => 'field'.($errors->has($name) ? ' field-error' : '');
@endphp

<x-layout :title="($editing ? 'Edit '.$project->name : 'New project').' | '.config('site.name')" description="Edit a case study." admin>

    <section class="shell pt-10 pb-24 md:pt-14">

        <a href="{{ route('projects.index') }}" class="text-link text-text-2">
            <span class="arrow rotate-180" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 256 256"><path d="M40 128h176M144 56l72 72-72 72" fill="none" stroke="currentColor" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
            All projects
        </a>

        <h1 class="display-l mt-5">{{ $editing ? $project->name : 'New project' }}</h1>

        @if (session('status'))
            <p role="status" class="notice mt-8">{{ session('status') }}</p>
        @endif

        @if ($errors->any())
            <div role="alert" class="notice notice-error mt-8 flex-col items-start">
                <p class="font-medium">{{ $errors->count() === 1 ? 'One field needs' : $errors->count().' fields need' }} attention before this can be saved.</p>
                <p class="small muted">Each one is marked below. Screenshots chosen before the error have to be chosen again.</p>
            </div>
        @endif

        <div class="mt-10 grid items-start gap-8 lg:grid-cols-12">

            <form
                id="project-form"
                method="POST"
                action="{{ $action }}"
                enctype="multipart/form-data"
                class="flex flex-col gap-6 lg:col-span-8"
                data-project-form
                novalidate
            >
                @csrf
                @if ($editing)
                    @method('PUT')
                @endif

                {{-- Basics --}}
                <fieldset class="form-group glass">
                    <legend>
                        <h2 class="heading">Basics</h2>
                        <p class="field-help">What the work list and the top of the case study show.</p>
                    </legend>

                    <div class="grid gap-5 sm:grid-cols-2">
                        <div>
                            <label for="name" class="field-label">Project name</label>
                            <input id="name" name="name" type="text" value="{{ old('name', $project->name) }}" required maxlength="120" class="{{ $field('name') }}" data-slug-source @error('name') aria-invalid="true" aria-describedby="name-error" @enderror>
                            @error('name') <p id="name-error" class="error-text">{{ $message }}</p> @enderror
                        </div>
                        <div>
                            <label for="slug" class="field-label">Address</label>
                            <input id="slug" name="slug" type="text" value="{{ old('slug', $project->slug) }}" required maxlength="80" pattern="[a-z0-9]+(-[a-z0-9]+)*" class="{{ $field('slug') }} field-mono" aria-describedby="slug-help @error('slug') slug-error @enderror" data-slug @error('slug') aria-invalid="true" @enderror>
                            @error('slug') <p id="slug-error" class="error-text">{{ $message }}</p> @enderror
                            <p id="slug-help" class="field-help">Lowercase letters, numbers and hyphens. The case study lives at /work/your-address.</p>
                        </div>
                    </div>

                    <fieldset class="m-0 min-w-0 border-0 p-0">
                        <legend class="field-label">Division</legend>
                        <div class="grid gap-3 sm:grid-cols-2">
                            @foreach (config('divisions') as $key => $division)
                                <label class="flex min-h-11 cursor-pointer items-center gap-3 rounded-[18px] border border-[rgb(27_26_23/0.18)] bg-white/40 px-4 py-3 has-checked:border-ink has-checked:bg-white/75">
                                    <input type="radio" name="division" value="{{ $key }}" @checked(old('division', $project->division) === $key)>
                                    <span class="h-px w-6 {{ $division['accent'] === 'vinca' ? 'bg-vinca' : 'bg-brass' }}" aria-hidden="true"></span>
                                    <span class="font-medium">{{ $division['short_name'] }}</span>
                                </label>
                            @endforeach
                        </div>
                        @error('division') <p class="error-text">{{ $message }}</p> @enderror
                    </fieldset>

                    <div>
                        <label for="summary" class="field-label">One-line summary</label>
                        <input id="summary" name="summary" type="text" value="{{ old('summary', $project->summary) }}" required maxlength="200" class="{{ $field('summary') }}" aria-describedby="summary-help" @error('summary') aria-invalid="true" @enderror>
                        @error('summary') <p class="error-text">{{ $message }}</p> @enderror
                        <p id="summary-help" class="field-help">Opens the case study, and is used by search engines when the description below is empty.</p>
                    </div>

                    <div>
                        <label for="index_summary" class="field-label">Summary on the work list <span class="font-normal text-stone">(optional)</span></label>
                        <input id="index_summary" name="index_summary" type="text" value="{{ old('index_summary', $project->index_summary) }}" maxlength="240" class="{{ $field('index_summary') }}" aria-describedby="index-help">
                        @error('index_summary') <p class="error-text">{{ $message }}</p> @enderror
                        <p id="index-help" class="field-help">Leave empty to reuse the one-line summary.</p>
                    </div>

                    <div class="grid gap-5 sm:grid-cols-2">
                        <div>
                            <label for="meta_label" class="field-label">Short label <span class="font-normal text-stone">(optional)</span></label>
                            <input id="meta_label" name="meta_label" type="text" value="{{ old('meta_label', $project->meta_label) }}" maxlength="80" class="{{ $field('meta_label') }}" aria-describedby="meta-help">
                            @error('meta_label') <p class="error-text">{{ $message }}</p> @enderror
                            <p id="meta-help" class="field-help">Under the name on the work list, for example the division and how long it took.</p>
                        </div>
                        <div>
                            <label for="position" class="field-label">Position</label>
                            <input id="position" name="position" type="number" min="1" max="999" value="{{ old('position', $project->position) }}" required class="{{ $field('position') }} field-mono" aria-describedby="position-help">
                            @error('position') <p class="error-text">{{ $message }}</p> @enderror
                            <p id="position-help" class="field-help">1 is shown first. Numbers on the site follow this order.</p>
                        </div>
                    </div>
                </fieldset>

                {{-- Facts --}}
                <fieldset class="form-group glass" data-repeat>
                    <legend>
                        <h2 class="heading">Facts</h2>
                        <p class="field-help">The strip under the title, such as role and duration. Two to four read best. Empty rows are ignored.</p>
                    </legend>

                    <div class="flex flex-col gap-3" data-repeat-rows>
                        @foreach ([...$facts, ['label' => '', 'value' => '']] as $i => $fact)
                            @include('admin.projects.partials.fact', ['i' => $i, 'fact' => $fact])
                        @endforeach
                    </div>
                    @error('facts') <p class="error-text">{{ $message }}</p> @enderror

                    <template>@include('admin.projects.partials.fact', ['i' => '__INDEX__', 'fact' => ['label' => '', 'value' => '']])</template>
                    <button type="button" class="add-button needs-js" data-repeat-add>Add a row</button>
                </fieldset>

                {{-- Story --}}
                <fieldset class="form-group glass">
                    <legend>
                        <h2 class="heading">Story</h2>
                        <p class="field-help">Leave a blank line between paragraphs.</p>
                    </legend>

                    @foreach (['situation' => 'Situation', 'constraint' => 'Constraint', 'result' => 'Result'] as $name => $label)
                        <div>
                            <label for="{{ $name }}" class="field-label">{{ $label }} @if ($name === 'constraint')<span class="font-normal text-stone">(optional)</span>@endif</label>
                            <textarea id="{{ $name }}" name="{{ $name }}" rows="6" maxlength="6000" class="{{ $field($name) }}" @error($name) aria-invalid="true" aria-describedby="{{ $name }}-error" @enderror>{{ old($name, $project->{$name}) }}</textarea>
                            @error($name) <p id="{{ $name }}-error" class="error-text">{{ $message }}</p> @enderror
                        </div>
                    @endforeach
                </fieldset>

                {{-- Decisions --}}
                <fieldset class="form-group glass" data-repeat>
                    <legend>
                        <h2 class="heading">Decisions</h2>
                        <p class="field-help">What was decided, and why. The first one is quoted on the home page.</p>
                    </legend>

                    @error('decisions') <p class="error-text">{{ $message }}</p> @enderror

                    <div class="flex flex-col" data-repeat-rows>
                        @foreach (count($decisions) ? $decisions : [['title' => '', 'body' => '']] as $i => $decision)
                            @include('admin.projects.partials.decision', ['i' => $i, 'decision' => $decision])
                        @endforeach
                    </div>

                    <template>@include('admin.projects.partials.decision', ['i' => '__INDEX__', 'decision' => ['title' => '', 'body' => '']])</template>
                    <button type="button" class="add-button needs-js" data-repeat-add>Add a decision</button>
                </fieldset>

                {{-- Composition --}}
                <fieldset class="form-group glass">
                    <legend>
                        <h2 class="heading">Composition</h2>
                        <p class="field-help">The stack, written as a perfume formula. Top is what a person meets, heart is the logic, base is the foundation.</p>
                    </legend>

                    <div class="composition rounded-[20px] border border-line">
                        @foreach (['top' => 'TOP', 'heart' => 'HEART', 'base' => 'BASE'] as $key => $layer)
                            <div class="composition-row items-center !py-4">
                                <label for="composition_{{ $key }}" class="composition-layer">{{ $layer }}</label>
                                <div>
                                    <input id="composition_{{ $key }}" name="composition_{{ $key }}" type="text" value="{{ old('composition_'.$key, $project->{'composition_'.$key}) }}" required maxlength="120" class="{{ $field('composition_'.$key) }} field-mono" @error('composition_'.$key) aria-invalid="true" @enderror>
                                    @error('composition_'.$key) <p class="error-text">{{ $message }}</p> @enderror
                                </div>
                            </div>
                        @endforeach
                    </div>
                </fieldset>

                {{-- Screenshots --}}
                <fieldset class="form-group glass" data-repeat>
                    <legend>
                        <h2 class="heading">Screenshots</h2>
                        <p class="field-help">JPG, PNG or WebP, 1600 to 4000 pixels wide, under 10 MB each. Smaller sizes are made when you save. The cover is used on the work list.</p>
                    </legend>

                    @error('uploads') <p class="error-text">{{ $message }}</p> @enderror

                    @if ($images->isNotEmpty())
                        <div>
                            @foreach ($images as $i => $image)
                                <div class="shot-row">
                                    <img src="{{ asset(Screenshots::path($image['file'], $image['uploaded'] ?? false, '-800w.jpg')) }}" alt="" class="shot-thumb" width="136" height="68">
                                    <div class="flex min-w-0 flex-col gap-3">
                                        <div>
                                            <label for="image-alt-{{ $i }}" class="field-label">Description for screen readers</label>
                                            <input id="image-alt-{{ $i }}" name="images[{{ $i }}][alt]" type="text" value="{{ $image['alt'] }}" maxlength="300" class="{{ $field("images.{$i}.alt") }}" @error("images.{$i}.alt") aria-invalid="true" aria-describedby="image-alt-{{ $i }}-error" @enderror>
                                            @error("images.{$i}.alt") <p id="image-alt-{{ $i }}-error" class="error-text">{{ $message }}</p> @enderror
                                        </div>
                                        <div class="flex flex-wrap gap-x-6 gap-y-1">
                                            <label class="flex min-h-11 cursor-pointer items-center gap-2.5 text-[0.9375rem]">
                                                <input type="radio" name="cover" value="existing:{{ $image['file'] }}" @checked($cover === 'existing:'.$image['file'])>
                                                Cover image
                                            </label>
                                            {{-- Unchecking leaves this screenshot out of the save,
                                                 which removes it. --}}
                                            <label class="flex min-h-11 cursor-pointer items-center gap-2.5 text-[0.9375rem]">
                                                <input type="checkbox" name="images[{{ $i }}][file]" value="{{ $image['file'] }}" checked>
                                                Keep this screenshot
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    @endif

                    <div class="flex flex-col gap-3" data-repeat-rows>
                        @include('admin.projects.partials.upload', ['i' => 0, 'cover' => $cover, 'first' => $images->isEmpty()])
                    </div>

                    <template>@include('admin.projects.partials.upload', ['i' => '__INDEX__', 'cover' => null, 'first' => false])</template>
                    <button type="button" class="add-button needs-js" data-repeat-add>Add another screenshot</button>
                </fieldset>

                {{-- Search and sharing --}}
                <fieldset class="form-group glass">
                    <legend>
                        <h2 class="heading">Search and sharing</h2>
                        <p class="field-help">Optional. Leave empty to build them from the name and the summary.</p>
                    </legend>

                    <div>
                        <label for="seo_title" class="field-label">Page title</label>
                        <input id="seo_title" name="seo_title" type="text" value="{{ old('seo_title', $project->seo_title) }}" maxlength="120" class="{{ $field('seo_title') }}">
                        @error('seo_title') <p class="error-text">{{ $message }}</p> @enderror
                    </div>
                    <div>
                        <label for="seo_description" class="field-label">Description</label>
                        <textarea id="seo_description" name="seo_description" rows="3" maxlength="300" class="{{ $field('seo_description') }}">{{ old('seo_description', $project->seo_description) }}</textarea>
                        @error('seo_description') <p class="error-text">{{ $message }}</p> @enderror
                    </div>
                </fieldset>

            </form>

            <aside class="glass flex flex-col gap-4 rounded-[28px] p-6 lg:sticky lg:top-28 lg:col-span-4" aria-label="Save">
                <p class="flex items-center gap-2.5 text-[0.9375rem] text-text-2" role="status" data-save-status>
                    <span class="status-dot" aria-hidden="true"></span>
                    <span data-save-text>{{ $editing ? 'All changes saved.' : 'Not saved yet.' }}</span>
                </p>

                <button type="submit" form="project-form" class="btn w-full">{{ $editing ? 'Save changes' : 'Add project' }}</button>

                <div class="flex flex-col border-t border-line pt-3">
                    @if ($editing)
                        <a href="{{ route('work.show', $project) }}" class="inline-flex min-h-11 items-center text-[0.9375rem] text-text-2 hover:text-ink">View on the site</a>
                    @endif
                    <a href="{{ route('projects.index') }}" class="inline-flex min-h-11 items-center text-[0.9375rem] text-text-2 hover:text-ink">Back to all projects</a>

                    @if ($editing)
                        <details class="confirm !items-stretch">
                            <summary class="inline-flex min-h-11 cursor-pointer list-none items-center text-[0.9375rem] text-danger hover:text-danger-deep">Delete this project</summary>
                            <div class="confirm-panel !w-full">
                                <p class="small">Its case study and the screenshots uploaded for it are removed. This cannot be undone.</p>
                                <form method="POST" action="{{ route('projects.destroy', $project) }}" class="mt-4">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn btn-danger btn-sm w-full">Delete project</button>
                                </form>
                            </div>
                        </details>
                    @endif
                </div>
            </aside>

        </div>

    </section>

</x-layout>
