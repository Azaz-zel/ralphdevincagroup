<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProjectAdminTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('work');
    }

    private function owner(): User
    {
        return User::create([
            'name' => 'Admin',
            'email' => 'owner@example.com',
            'password' => bcrypt('a-long-enough-password'),
        ]);
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Warung Booking',
            'slug' => 'warung-booking',
            'division' => 'technology',
            'position' => 4,
            'summary' => 'A booking page for a small warung.',
            'facts' => [
                ['label' => 'Role', 'value' => 'Design and development'],
                ['label' => '', 'value' => ''],
            ],
            'situation' => "Orders arrived by phone.\n\nSome were lost.",
            'result' => 'Orders arrive in one place.',
            'decisions' => [
                ['title' => 'Phone number stays.', 'body' => 'Regulars still call, so the page never hides the number.'],
                ['title' => '', 'body' => ''],
            ],
            'composition_top' => 'Blade',
            'composition_heart' => 'Laravel',
            'composition_base' => 'MySQL',
            'uploads' => [UploadedFile::fake()->image('home.png', 1800, 900)],
            'upload_alts' => ['The booking page on a laptop.'],
            'cover' => 'new:0',
        ], $overrides);
    }

    public function test_a_guest_cannot_reach_any_project_admin_route(): void
    {
        $project = Project::ordered()->first();

        $this->get(route('projects.index'))->assertRedirect(route('login'));
        $this->get(route('projects.create'))->assertRedirect(route('login'));
        $this->get(route('projects.edit', $project))->assertRedirect(route('login'));
        $this->post(route('projects.store'), $this->payload())->assertRedirect(route('login'));
        $this->put(route('projects.update', $project), $this->payload())->assertRedirect(route('login'));
        $this->delete(route('projects.destroy', $project))->assertRedirect(route('login'));

        $this->assertDatabaseCount('projects', 3);
        $this->assertDatabaseMissing('projects', ['slug' => 'warung-booking']);
    }

    public function test_the_owner_sees_every_project_in_order(): void
    {
        $this->actingAs($this->owner())
            ->get(route('projects.index'))
            ->assertOk()
            ->assertSeeInOrder(['Ralph de Vinca Perfumery', 'Bali Cebelok Gesiuh', 'PKKMB INSTIKI 2026']);
    }

    public function test_a_new_project_is_stored_with_every_screenshot_size_and_goes_live(): void
    {
        $this->actingAs($this->owner())
            ->post(route('projects.store'), $this->payload())
            ->assertRedirect(route('projects.index'))
            ->assertSessionHasNoErrors();

        $project = Project::where('slug', 'warung-booking')->sole();

        // Empty rows from "Add a row" are dropped, not stored.
        $this->assertCount(1, $project->facts);
        $this->assertCount(1, $project->decisions);
        $this->assertSame(['Orders arrived by phone.', 'Some were lost.'], $project->paragraphs('situation'));

        $image = $project->coverImage();
        $this->assertTrue($image['uploaded']);
        $this->assertSame(1600, $image['width']);
        $this->assertSame(800, $image['height']);
        $this->assertStringStartsWith('warung-booking-', $image['file']);

        foreach (['jpg', 'webp'] as $format) {
            Storage::disk('work')->assertExists("{$image['file']}.{$format}");

            foreach ([800, 1200, 1600] as $width) {
                Storage::disk('work')->assertExists("{$image['file']}-{$width}w.{$format}");
            }
        }

        // Served from the persistent storage volume, not from public/.
        $this->get(route('work.show', $project))
            ->assertOk()
            ->assertSee('Warung Booking')
            ->assertSee('Phone number stays.')
            ->assertSee("storage/work/{$image['file']}-1600w.webp", false);

        $this->get(route('home'))->assertSee('Four things built so far.');
        $this->get(route('sitemap'))->assertSee(route('work.show', $project));
    }

    public function test_a_project_can_be_edited_and_a_screenshot_removed(): void
    {
        $owner = $this->owner();

        $this->actingAs($owner)->post(route('projects.store'), $this->payload());
        $project = Project::where('slug', 'warung-booking')->sole();
        $old = $project->coverImage()['file'];

        $this->actingAs($owner)
            ->put(route('projects.update', $project), $this->payload([
                'name' => 'Warung Orders',
                'images' => [],
                'uploads' => [UploadedFile::fake()->image('new.jpg', 2000, 1000)],
                'upload_alts' => ['The new order page.'],
            ]))
            ->assertRedirect(route('projects.edit', 'warung-booking'))
            ->assertSessionHasNoErrors();

        $project->refresh();

        $this->assertSame('Warung Orders', $project->name);
        $this->assertCount(1, $project->images);
        $this->assertNotSame($old, $project->coverImage()['file']);
        Storage::disk('work')->assertMissing("{$old}.jpg");
        Storage::disk('work')->assertMissing("{$old}-800w.webp");
    }

    public function test_deleting_a_project_removes_its_uploads_but_never_a_shipped_screenshot(): void
    {
        $owner = $this->owner();

        $this->actingAs($owner)->post(route('projects.store'), $this->payload());
        $created = Project::where('slug', 'warung-booking')->sole();
        $file = $created->coverImage()['file'];

        $this->actingAs($owner)->delete(route('projects.destroy', $created))->assertRedirect(route('projects.index'));

        $this->assertDatabaseMissing('projects', ['slug' => 'warung-booking']);
        Storage::disk('work')->assertMissing("{$file}.jpg");

        // A seeded project points at files in the repository, which stay.
        Storage::disk('work')->put('balicebelok.jpg', 'shipped');
        $seeded = Project::where('slug', 'bali-cebelok-gesiuh')->sole();

        $this->actingAs($owner)->delete(route('projects.destroy', $seeded));

        Storage::disk('work')->assertExists('balicebelok.jpg');
        $this->get(route('work.show', 'bali-cebelok-gesiuh'))->assertNotFound();
    }

    public function test_a_file_that_is_not_an_image_is_rejected(): void
    {
        $this->actingAs($this->owner())
            ->post(route('projects.store'), $this->payload([
                'uploads' => [UploadedFile::fake()->create('shell.php', 12, 'image/png')],
            ]))
            ->assertSessionHasErrors('uploads.0');

        $this->assertDatabaseMissing('projects', ['slug' => 'warung-booking']);
        $this->assertSame([], Storage::disk('work')->allFiles());
    }

    public function test_a_screenshot_narrower_than_1600_pixels_is_rejected(): void
    {
        $this->actingAs($this->owner())
            ->post(route('projects.store'), $this->payload([
                'uploads' => [UploadedFile::fake()->image('small.png', 900, 500)],
            ]))
            ->assertSessionHasErrors('uploads.0');
    }

    public function test_every_upload_needs_a_description(): void
    {
        $this->actingAs($this->owner())
            ->post(route('projects.store'), $this->payload(['upload_alts' => ['']]))
            ->assertSessionHasErrors('upload_alts.0');
    }

    public function test_a_project_needs_at_least_one_screenshot(): void
    {
        $this->actingAs($this->owner())
            ->post(route('projects.store'), $this->payload(['uploads' => [], 'upload_alts' => []]))
            ->assertSessionHasErrors('uploads');
    }

    public function test_an_address_must_be_a_clean_unique_slug(): void
    {
        $owner = $this->owner();

        foreach (['../etc/passwd', 'Has Spaces', 'trailing-', 'bali-cebelok-gesiuh'] as $slug) {
            $this->actingAs($owner)
                ->post(route('projects.store'), $this->payload(['slug' => $slug]))
                ->assertSessionHasErrors('slug');
        }

        $this->assertDatabaseCount('projects', 3);
    }

    /**
     * Keeping an image is by file name, and only names this project already
     * owns are accepted. Anything else could point the case study, and later a
     * delete, at a file that belongs to another project.
     */
    public function test_a_project_cannot_claim_a_screenshot_it_does_not_own(): void
    {
        $owner = $this->owner();
        $project = Project::where('slug', 'pkkmb-instiki')->sole();

        foreach (['balicebelok', '../../../.env', 'ralph-home'] as $file) {
            $this->actingAs($owner)
                ->put(route('projects.update', $project), $this->payload([
                    'slug' => 'pkkmb-instiki',
                    'images' => [['file' => $file, 'alt' => 'Not mine.']],
                    'uploads' => [],
                    'upload_alts' => [],
                ]))
                ->assertSessionHasErrors('images.0.file');
        }

        $this->assertSame('absensi-mahasiswa', $project->fresh()->coverImage()['file']);
    }

    public function test_an_unknown_division_is_rejected(): void
    {
        $this->actingAs($this->owner())
            ->post(route('projects.store'), $this->payload(['division' => 'fragrance-lab']))
            ->assertSessionHasErrors('division');
    }

    public function test_text_entered_in_the_admin_is_escaped_on_the_public_page(): void
    {
        $this->actingAs($this->owner())->post(route('projects.store'), $this->payload([
            'name' => '<script>alert(1)</script>',
            'decisions' => [['title' => '<img src=x onerror=alert(1)>', 'body' => 'Escaped, always.']],
        ]));

        $response = $this->get(route('work.show', 'warung-booking'))->assertOk();

        $response->assertDontSee('<script>alert(1)</script>', false);
        $response->assertDontSee('<img src=x onerror=alert(1)>', false);
        $response->assertSee('&lt;script&gt;', false);

        $this->get(route('home'))->assertDontSee('<img src=x onerror=alert(1)>', false);
    }

    public function test_the_admin_pages_are_kept_out_of_search_engines(): void
    {
        $this->actingAs($this->owner())
            ->get(route('projects.index'))
            ->assertSee('<meta name="robots" content="noindex, nofollow">', false);
    }
}
