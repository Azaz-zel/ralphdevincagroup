<?php

namespace App\Http\Controllers;

use Illuminate\View\View;

class WorkController extends Controller
{
    public function index(): View
    {
        return view('pages.work', [
            'projects' => config('projects'),
        ]);
    }

    public function show(string $project): View
    {
        $projects = config('projects');

        $index = collect($projects)->search(fn (array $entry) => $entry['slug'] === $project);

        abort_if($index === false, 404);

        return view('pages.work-show', [
            'project' => $projects[$index],
            // Wraps around, so the last case study leads back to the first.
            'next' => $projects[($index + 1) % count($projects)],
        ]);
    }
}
