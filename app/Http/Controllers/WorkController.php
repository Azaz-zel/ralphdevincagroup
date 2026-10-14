<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Support\Number;
use Illuminate\Support\Str;
use Illuminate\View\View;

class WorkController extends Controller
{
    public function home(): View
    {
        return view('pages.home', [
            'projects' => Project::ordered()->get(),
        ]);
    }

    public function index(): View
    {
        $projects = Project::ordered()->get();

        return view('pages.work', [
            'projects' => $projects,
            // Counted rather than typed, so the description cannot outlive the
            // number of projects it claims.
            'metaDescription' => Str::ucfirst(Number::spell($projects->count()))
                .' projects across fragrance and software, with the decisions behind each one.',
        ]);
    }

    public function show(Project $project): View
    {
        $projects = Project::ordered()->get();

        $index = $projects->search(fn (Project $entry) => $entry->is($project));

        return view('pages.work-show', [
            'project' => $project,
            // Wraps around, so the last case study leads back to the first.
            'next' => $projects->count() > 1 ? $projects[($index + 1) % $projects->count()] : null,
        ]);
    }
}
