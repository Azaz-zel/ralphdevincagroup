<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProjectRequest;
use App\Models\Project;
use App\Support\Screenshots;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\View\View;
use Throwable;

class ProjectController extends Controller
{
    public function __construct(private Screenshots $screenshots) {}

    public function index(): View
    {
        return view('admin.projects.index', [
            'projects' => Project::ordered()->get(),
        ]);
    }

    public function create(): View
    {
        return view('admin.projects.form', [
            'project' => new Project([
                'division' => 'technology',
                'position' => (int) Project::max('position') + 1,
                'facts' => [],
                'decisions' => [],
                'images' => [],
            ]),
        ]);
    }

    public function store(ProjectRequest $request): RedirectResponse
    {
        $project = $this->save($request, new Project);

        return redirect()
            ->route('projects.index')
            ->with('status', "{$project->name} added. Its case study is live.");
    }

    public function edit(Project $project): View
    {
        return view('admin.projects.form', ['project' => $project]);
    }

    public function update(ProjectRequest $request, Project $project): RedirectResponse
    {
        $project = $this->save($request, $project);

        return redirect()
            ->route('projects.edit', $project)
            ->with('status', 'Saved. The site is updated.');
    }

    public function destroy(Project $project): RedirectResponse
    {
        $name = $project->name;
        $images = $project->images ?? [];

        $project->delete();

        foreach ($images as $image) {
            $this->screenshots->delete($image);
        }

        return redirect()
            ->route('projects.index')
            ->with('status', "{$name} deleted.");
    }

    /**
     * Writes new screenshots first and deletes dropped ones last, so a failure
     * at any point leaves the published case study exactly as it was.
     */
    private function save(ProjectRequest $request, Project $project): Project
    {
        $data = $request->validated();
        $before = $project->images ?? [];

        // Kept screenshots, in the submitted order, with their edited text.
        $byFile = collect($before)->keyBy('file');
        $kept = collect($data['images'] ?? [])
            ->map(fn (array $image) => array_merge($byFile[$image['file']], ['alt' => $image['alt']]))
            ->values()
            ->all();

        $added = [];

        try {
            foreach ($request->file('uploads', []) as $index => $upload) {
                $added["new:{$index}"] = $this->screenshots->store($upload, $data['slug'])
                    + ['alt' => $data['upload_alts'][$index]];
            }

            $project->fill([
                ...collect($data)->except(['images', 'uploads', 'upload_alts', 'cover'])->all(),
                'facts' => $data['facts'] ?? [],
                'images' => array_merge($kept, array_values($added)),
                'cover' => $this->coverIndex($data['cover'] ?? null, $kept, array_keys($added)),
            ])->save();
        } catch (Throwable $e) {
            foreach ($added as $image) {
                $this->screenshots->delete($image);
            }

            report($e);

            throw ValidationException::withMessages([
                'uploads' => 'The screenshots could not be processed. Try a different file, or save again.',
            ]);
        }

        $keptFiles = array_column($kept, 'file');

        foreach ($before as $image) {
            if (! in_array($image['file'], $keptFiles, true)) {
                $this->screenshots->delete($image);
            }
        }

        return $project;
    }

    /**
     * The form names its cover "existing:<file>" or "new:<upload index>".
     *
     * @param  array<int, array<string, mixed>>  $kept
     * @param  array<int, string>  $addedKeys
     */
    private function coverIndex(?string $cover, array $kept, array $addedKeys): int
    {
        if ($cover === null) {
            return 0;
        }

        if (str_starts_with($cover, 'existing:')) {
            $index = array_search(substr($cover, 9), array_column($kept, 'file'), true);

            return $index === false ? 0 : $index;
        }

        $index = array_search($cover, $addedKeys, true);

        return $index === false ? 0 : count($kept) + $index;
    }
}
