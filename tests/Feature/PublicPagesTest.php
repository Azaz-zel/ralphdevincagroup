<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicPagesTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array<int, string>
     */
    private function publicUrls(): array
    {
        $urls = [
            route('home'),
            route('about'),
            route('perfumery'),
            route('technology'),
            route('work'),
            route('contact'),
            route('privacy'),
        ];

        foreach (config('projects') as $project) {
            $urls[] = route('work.show', $project['slug']);
        }

        return $urls;
    }

    /**
     * PRD acceptance criterion 1.
     */
    public function test_every_public_page_responds(): void
    {
        foreach ($this->publicUrls() as $url) {
            $this->get($url)->assertOk();
        }
    }

    public function test_an_unknown_case_study_is_a_404(): void
    {
        $this->get('/work/a-project-that-does-not-exist')->assertNotFound();
    }

    /**
     * PRD acceptance criterion 12.
     */
    public function test_no_page_carries_the_old_identity(): void
    {
        foreach ($this->publicUrls() as $url) {
            $this->get($url)->assertDontSee('Clive Christian');
        }
    }

    /**
     * PRD acceptance criterion 2. The group is one person, so nothing may
     * speak as a team. Checked against visible text, since markup and CSS
     * class names legitimately contain these letter sequences.
     */
    public function test_no_page_speaks_as_a_team(): void
    {
        foreach ($this->publicUrls() as $url) {
            $text = $this->visibleText($this->get($url)->assertOk()->getContent());

            $this->assertDoesNotMatchRegularExpression(
                '/\b(we|we\'re|we\'ve|our|ours|us)\b/i',
                $text,
                "First-person plural found on {$url}",
            );
        }
    }

    /**
     * PRD acceptance criterion 4 — no page may promise how long work takes.
     * The durations that already happened (two weeks, one week, fifteen days)
     * are facts and are allowed; a promise reads as "in" or "within" a period.
     */
    public function test_no_page_promises_a_delivery_time(): void
    {
        foreach ($this->publicUrls() as $url) {
            $text = $this->visibleText($this->get($url)->getContent());

            $this->assertDoesNotMatchRegularExpression(
                '/\b(?:ready|delivered|finished|done|built|live)\s+(?:in|within)\s+\d/i',
                $text,
                "A delivery-time promise appears on {$url}",
            );
        }
    }

    /**
     * PRD acceptance criterion 5.
     */
    public function test_the_composition_element_appears_on_the_home_page_and_every_case_study(): void
    {
        $this->get(route('home'))->assertSee('HEART');

        foreach (config('projects') as $project) {
            $this->get(route('work.show', $project['slug']))
                ->assertSee('TOP')
                ->assertSee('HEART')
                ->assertSee('BASE');
        }
    }

    /**
     * PRD acceptance criterion 6.
     */
    public function test_every_case_study_explains_at_least_three_decisions(): void
    {
        foreach (config('projects') as $project) {
            $this->assertGreaterThanOrEqual(
                3,
                count($project['decisions']),
                "{$project['slug']} has fewer than three decisions",
            );

            $response = $this->get(route('work.show', $project['slug']))->assertOk();

            foreach ($project['decisions'] as $decision) {
                $response->assertSeeText($decision['title']);
            }
        }
    }

    /**
     * PRD acceptance criterion 11.
     */
    public function test_the_about_page_carries_its_six_sections_in_order(): void
    {
        $content = $this->get(route('about'))->assertOk()->getContent();

        $sections = [
            'the-name',
            'what-this-is-built-on',
            'how-it-happened',
            'four-principles',
            'the-founder',
            'editorial-commitment',
        ];

        $positions = [];

        foreach ($sections as $section) {
            $position = strpos($content, 'id="'.$section.'"');
            $this->assertNotFalse($position, "About is missing the {$section} section");
            $positions[] = $position;
        }

        $sorted = $positions;
        sort($sorted);

        $this->assertSame($sorted, $positions, 'The About sections are out of order');
    }

    public function test_each_page_has_its_own_title_and_description(): void
    {
        $titles = [];
        $descriptions = [];

        foreach ($this->publicUrls() as $url) {
            $content = $this->get($url)->getContent();

            preg_match('/<title>(.*?)<\/title>/s', $content, $title);
            preg_match('/<meta name="description" content="(.*?)"/s', $content, $description);

            $this->assertNotEmpty($title[1] ?? '', "No title on {$url}");
            $this->assertNotEmpty($description[1] ?? '', "No description on {$url}");

            $titles[] = $title[1];
            $descriptions[] = $description[1];
        }

        $this->assertSame($titles, array_unique($titles), 'Two pages share a title');
        $this->assertSame($descriptions, array_unique($descriptions), 'Two pages share a description');
    }

    public function test_every_page_offers_a_skip_link_and_one_heading_of_the_first_level(): void
    {
        foreach ($this->publicUrls() as $url) {
            $content = $this->get($url)->getContent();

            $this->assertStringContainsString('class="skip-link"', $content, "No skip link on {$url}");
            $this->assertSame(1, substr_count($content, '<h1'), "Expected exactly one h1 on {$url}");
        }
    }

    /**
     * Strip markup, scripts and styles so text assertions look at what a
     * visitor actually reads.
     */
    private function visibleText(string $html): string
    {
        $html = preg_replace('/<script\b.*?<\/script>|<style\b.*?<\/style>/si', ' ', $html);

        return html_entity_decode(strip_tags($html), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }
}
