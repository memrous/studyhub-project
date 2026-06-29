<?php

namespace Tests\Feature;

use App\Models\Subject;
use App\Models\Event;
use App\Models\Material;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SubjectFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_delete_their_own_subject_and_associated_relations(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $subject = Subject::create([
            'user_id' => $user->id,
            'code' => 'KMI/ALGO1',
            'name' => 'Algorithms 1',
            'credits' => 5,
            'lecturer' => 'Dr. Smith',
            'completion_type' => 'Credit',
            'is_mandatory' => true,
            'semester' => 'Winter',
            'description' => 'Intro to algorithms',
        ]);

        $event = Event::create([
            'subject_id' => $subject->id,
            'title' => 'Lecture 1',
            'type' => 'Lecture',
            'date' => '2026-06-26',
            'time' => '10:00',
            'end_time' => '12:00',
            'status' => 'Pending',
        ]);

        $material = Material::create([
            'subject_id' => $subject->id,
            'title' => 'Lecture Notes',
            'type' => 'pdf',
            'description' => 'Notes for week 1',
            'url' => 'https://example.com/notes.pdf',
            'size' => '2.5 MB',
        ]);

        // Assert they exist in DB
        $this->assertDatabaseHas('subjects', ['id' => $subject->id]);
        $this->assertDatabaseHas('events', ['id' => $event->id]);
        $this->assertDatabaseHas('resources', ['id' => $material->id]);

        // Send delete request
        $response = $this->deleteJson("/api/subjects/{$subject->id}");

        // Assert response
        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Subject deleted successfully.',
                'id' => $subject->id,
            ]);

        // Assert they are deleted from DB
        $this->assertDatabaseMissing('subjects', ['id' => $subject->id]);
        $this->assertDatabaseMissing('events', ['id' => $event->id]);
        $this->assertDatabaseMissing('resources', ['id' => $material->id]);
    }

    public function test_user_cannot_delete_another_users_subject(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $subject = Subject::create([
            'user_id' => $user2->id,
            'code' => 'KMI/ALGO1',
            'name' => 'Algorithms 1',
            'credits' => 5,
            'lecturer' => 'Dr. Smith',
            'completion_type' => 'Credit',
            'is_mandatory' => true,
            'semester' => 'Winter',
        ]);

        Sanctum::actingAs($user1);

        $response = $this->deleteJson("/api/subjects/{$subject->id}");

        $response->assertStatus(404);
        $this->assertDatabaseHas('subjects', ['id' => $subject->id]);
    }
}
