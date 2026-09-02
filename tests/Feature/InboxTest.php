<?php

namespace Tests\Feature;

use App\Models\Inquiry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InboxTest extends TestCase
{
    use RefreshDatabase;

    private function inquiry(array $overrides = []): Inquiry
    {
        return Inquiry::create(array_merge([
            'name' => 'Kadek Ayu',
            'email' => 'kadek@example.com',
            'division' => 'unsure',
            'message' => 'I run a small warung and would like a page people can find and order from.',
        ], $overrides));
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
     * PRD acceptance criterion 8.
     */
    public function test_a_guest_cannot_reach_the_inbox(): void
    {
        $inquiry = $this->inquiry();

        $this->get(route('inbox'))->assertRedirect(route('login'));
        $this->get(route('inbox.show', $inquiry))->assertRedirect(route('login'));
        $this->patch(route('inbox.update', $inquiry), ['status' => 'replied'])->assertRedirect(route('login'));

        $this->assertSame('new', $inquiry->fresh()->status);
    }

    /**
     * PRD acceptance criterion 8 — no public registration route survives.
     */
    public function test_there_is_no_registration_route(): void
    {
        $this->get('/register')->assertNotFound();
        $this->post('/register')->assertNotFound();

        $this->assertFalse(app('router')->has('register'));
    }

    public function test_the_owner_sees_the_list_and_the_number_of_new_messages(): void
    {
        $this->inquiry();
        $this->inquiry(['name' => 'Putu Ardana', 'email' => 'putu@example.com']);

        $response = $this->actingAs($this->owner())->get(route('inbox'));

        $response->assertOk();
        $response->assertSee('Kadek Ayu');
        $response->assertSee('Putu Ardana');
        $response->assertSee('2 new');
    }

    public function test_the_list_can_be_filtered_by_status(): void
    {
        $this->inquiry();

        // Assigned rather than mass-assigned: `status` is not fillable, so a
        // visitor can never choose the state their own message arrives in.
        $archived = $this->inquiry(['name' => 'Putu Ardana', 'email' => 'putu@example.com']);
        $archived->status = 'archived';
        $archived->save();

        $response = $this->actingAs($this->owner())->get(route('inbox', ['status' => 'archived']));

        $response->assertOk();
        $response->assertSee('Putu Ardana');
        $response->assertDontSee('Kadek Ayu');
    }

    /**
     * PRD acceptance criterion 9.
     */
    public function test_opening_a_new_message_marks_it_read_and_stamps_the_time(): void
    {
        $inquiry = $this->inquiry();

        $this->assertSame('new', $inquiry->status);
        $this->assertNull($inquiry->read_at);

        $this->actingAs($this->owner())
            ->get(route('inbox.show', $inquiry))
            ->assertOk();

        $inquiry->refresh();

        $this->assertSame('read', $inquiry->status);
        $this->assertNotNull($inquiry->read_at);
    }

    public function test_reopening_a_message_keeps_the_first_read_time(): void
    {
        $inquiry = $this->inquiry();
        $owner = $this->owner();

        $this->actingAs($owner)->get(route('inbox.show', $inquiry));

        $firstRead = $inquiry->fresh()->read_at;

        $this->travel(5)->minutes();

        $this->actingAs($owner)->get(route('inbox.show', $inquiry));

        $this->assertTrue($firstRead->equalTo($inquiry->fresh()->read_at));
    }

    public function test_marking_a_message_replied_stamps_the_time(): void
    {
        $inquiry = $this->inquiry();

        $this->actingAs($this->owner())
            ->patch(route('inbox.update', $inquiry), ['status' => 'replied'])
            ->assertRedirect();

        $inquiry->refresh();

        $this->assertSame('replied', $inquiry->status);
        $this->assertNotNull($inquiry->replied_at);
    }

    public function test_a_message_can_be_archived(): void
    {
        $inquiry = $this->inquiry();

        $this->actingAs($this->owner())->patch(route('inbox.update', $inquiry), ['status' => 'archived']);

        $this->assertSame('archived', $inquiry->fresh()->status);
        $this->assertNull($inquiry->fresh()->replied_at);
    }

    public function test_the_list_can_be_searched_by_name_email_or_message(): void
    {
        $this->inquiry();
        $this->inquiry([
            'name' => 'Putu Ardana',
            'email' => 'putu@example.com',
            'message' => 'Our diving school tracks four hundred students in spreadsheets.',
        ]);

        $owner = $this->owner();

        $byName = $this->actingAs($owner)->get(route('inbox', ['q' => 'Putu']));
        $byName->assertSee('Putu Ardana')->assertDontSee('Kadek Ayu');

        $byEmail = $this->actingAs($owner)->get(route('inbox', ['q' => 'kadek@example.com']));
        $byEmail->assertSee('Kadek Ayu')->assertDontSee('Putu Ardana');

        $byMessage = $this->actingAs($owner)->get(route('inbox', ['q' => 'diving school']));
        $byMessage->assertSee('Putu Ardana')->assertDontSee('Kadek Ayu');
    }

    public function test_a_search_that_matches_nothing_says_so(): void
    {
        $this->inquiry();

        $this->actingAs($this->owner())
            ->get(route('inbox', ['q' => 'nothing-matches-this']))
            ->assertOk()
            ->assertSeeText('Nothing matches');
    }

    public function test_search_and_status_filter_apply_together(): void
    {
        $this->inquiry(['name' => 'Kadek Ayu']);

        $archived = $this->inquiry(['name' => 'Kadek Archived', 'email' => 'other@example.com']);
        $archived->status = 'archived';
        $archived->save();

        $response = $this->actingAs($this->owner())
            ->get(route('inbox', ['q' => 'Kadek', 'status' => 'archived']));

        $response->assertSee('Kadek Archived');
        $response->assertDontSee('Kadek Ayu');
    }

    /**
     * A wildcard typed into the search box is searched for literally rather
     * than matching every row.
     */
    public function test_a_percent_sign_in_the_search_is_not_a_wildcard(): void
    {
        $this->inquiry();

        $this->actingAs($this->owner())
            ->get(route('inbox', ['q' => '%']))
            ->assertOk()
            ->assertDontSee('Kadek Ayu');
    }

    public function test_a_message_can_be_put_back_in_the_unread_pile(): void
    {
        $inquiry = $this->inquiry();
        $owner = $this->owner();

        $this->actingAs($owner)->get(route('inbox.show', $inquiry));

        $firstRead = $inquiry->fresh()->read_at;
        $this->assertNotNull($firstRead);

        $this->actingAs($owner)
            ->patch(route('inbox.update', $inquiry), ['status' => 'new'])
            ->assertRedirect();

        $this->assertSame('new', $inquiry->fresh()->status);

        // Opening it again must not rewrite when it was first seen.
        $this->travel(10)->minutes();
        $this->actingAs($owner)->get(route('inbox.show', $inquiry));

        $inquiry->refresh();

        $this->assertSame('read', $inquiry->status);
        $this->assertTrue($firstRead->equalTo($inquiry->read_at));
    }

    public function test_an_unknown_status_is_rejected(): void
    {
        $inquiry = $this->inquiry();

        $this->actingAs($this->owner())
            ->patch(route('inbox.update', $inquiry), ['status' => 'deleted'])
            ->assertSessionHasErrors('status');

        $this->assertSame('new', $inquiry->fresh()->status);
    }

    public function test_a_message_body_is_escaped_rather_than_rendered(): void
    {
        $inquiry = $this->inquiry([
            'message' => 'Please look at <script>alert(1)</script> this problem with my booking page.',
        ]);

        $response = $this->actingAs($this->owner())->get(route('inbox.show', $inquiry));

        $response->assertOk();
        $response->assertDontSee('<script>alert(1)</script>', false);
        $response->assertSee('&lt;script&gt;', false);
    }
}
