@props([
    'projects',
    // h3 under a section heading, h2 where the list is the page's top-level
    // content and there is no section heading above it.
    'level' => 'h3',
])

@php
    $first = $projects->first();
@endphp

{{--
    A list of case studies beside one sticky viewer. The row in focus decides
    which screenshot the viewer shows, so hovering never changes the height of
    the list. Below the wide breakpoint the viewer goes away and each row shows
    its own screenshot.
--}}

<div class="work-grid" data-work>

    <ol class="work-list">
        @foreach ($projects as $project)
            @php
                $cover = $project->coverImage();
                $decision = $project->decisions[0]['title'] ?? null;
            @endphp

            <li
                class="work-item reveal accent-{{ $project->accent() }} {{ $loop->first ? 'is-active' : '' }} relative"
                data-work-item
                data-name="{{ $project->name }}"
                data-href="{{ route('work.show', $project) }}"
            >
                <span class="mono pt-1.5 text-xs text-stone tabular-nums">{{ str_pad((string) $loop->iteration, 2, '0', STR_PAD_LEFT) }}</span>

                <div class="flex min-w-0 flex-col gap-2.5">

                    <{{ $level }} class="heading">
                        {{-- The title link covers the whole row. --}}
                        <a href="{{ route('work.show', $project) }}" class="after:absolute after:inset-0 after:rounded-[24px] after:content-['']">
                            {{ $project->name }}
                        </a>
                    </{{ $level }}>

                    @if ($project->meta_label)
                        <p class="label">{{ $project->meta_label }}</p>
                    @endif

                    <p class="body-text">{{ $project->listSummary() }}</p>

                    @if ($decision)
                        <p class="work-decision">
                            <span class="label">Key decision</span>
                            <span class="work-decision-text">{{ $decision }}</span>
                        </p>
                    @endif

                    @if ($cover)
                        <div class="work-item-shot">
                            <x-picture
                                :file="$cover['file']"
                                :alt="$cover['alt']"
                                :width="$cover['width'] ?? null"
                                :height="$cover['height'] ?? null"
                                :uploaded="$cover['uploaded'] ?? false"
                                sizes="100vw"
                            />
                        </div>
                    @endif

                </div>
            </li>
        @endforeach
    </ol>

    @if ($first)
        {{-- Duplicates the row screenshots for pointer users, so it is hidden
             from assistive technology; each row already carries its image. --}}
        <div class="work-viewer glass" aria-hidden="true">
            <div class="viewer-frame">
                @foreach ($projects as $project)
                    @php($cover = $project->coverImage())
                    @if ($cover)
                        <x-picture
                            :file="$cover['file']"
                            alt=""
                            :width="$cover['width'] ?? null"
                            :height="$cover['height'] ?? null"
                            :uploaded="$cover['uploaded'] ?? false"
                            sizes="(min-width: 1280px) 640px, 55vw"
                            class="viewer-shot {{ $loop->first ? 'is-active' : '' }}"
                            data-work-shot
                        />
                    @else
                        <span class="viewer-shot" data-work-shot></span>
                    @endif
                @endforeach
            </div>
            <div class="flex items-center justify-between gap-4 px-2.5 pt-4 pb-1">
                <span class="label" data-work-name>{{ $first->name }}</span>
                <a href="{{ route('work.show', $first) }}" class="text-link" tabindex="-1" data-work-link>
                    Read the case study
                    <span class="arrow"><svg width="14" height="14" viewBox="0 0 256 256"><path d="M40 128h176M144 56l72 72-72 72" fill="none" stroke="currentColor" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
                </a>
            </div>
        </div>
    @endif

</div>
