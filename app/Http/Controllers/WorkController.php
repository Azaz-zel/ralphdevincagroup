<?php

namespace App\Http\Controllers;

use Illuminate\Support\Number;
use Illuminate\Support\Str;
use Illuminate\View\View;

class WorkController extends Controller
{
    public function index(): View
    {
        $projects = config('projects');

        return view('pages.work', [
            'projects' => $projects,
            // Counted rather than typed, so the description cannot outlive the
            // number of projects it claims.
            'metaDescription' => Str::ucfirst(Number::spell(count($projects)))
                .' projects across fragrance and software, with the decisions behind each one.',
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
