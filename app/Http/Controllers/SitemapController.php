<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * Built from the routes and the projects table, so a case study added in
     * the admin is in the sitemap without a second edit.
     */
    public function __invoke(): Response
    {
        $urls = [
            ['loc' => route('home'), 'changefreq' => 'monthly', 'priority' => '1.0'],
            ['loc' => route('about'), 'changefreq' => 'yearly', 'priority' => '0.8'],
            ['loc' => route('perfumery'), 'changefreq' => 'yearly', 'priority' => '0.8'],
            ['loc' => route('technology'), 'changefreq' => 'yearly', 'priority' => '0.8'],
            ['loc' => route('work'), 'changefreq' => 'monthly', 'priority' => '0.8'],
        ];

        foreach (Project::ordered()->pluck('slug') as $slug) {
            $urls[] = [
                'loc' => route('work.show', $slug),
                'changefreq' => 'yearly',
                'priority' => '0.6',
            ];
        }

        $urls[] = ['loc' => route('contact'), 'changefreq' => 'yearly', 'priority' => '0.7'];
        $urls[] = ['loc' => route('privacy'), 'changefreq' => 'yearly', 'priority' => '0.3'];

        return response()
            ->view('sitemap', ['urls' => $urls])
            ->header('Content-Type', 'application/xml');
    }
}
