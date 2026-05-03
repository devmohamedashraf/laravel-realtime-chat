<?php

use App\Models\Message;
use App\Models\User;

test('guests cannot search messages', function () {
    $this->getJson('/api/messages/search?q=hello')
        ->assertUnauthorized();
});

test('user can search their messages by content', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();

    Message::factory()->create(['sender_id' => $user->id, 'recipient_id' => $other->id, 'content' => 'Hello there friend']);
    Message::factory()->create(['sender_id' => $other->id, 'recipient_id' => $user->id, 'content' => 'Hello back']);

    $response = $this->actingAs($user)
        ->getJson('/api/messages/search?q=Hello')
        ->assertSuccessful();

    expect($response->json('data'))->toHaveCount(2);
});

test('search only returns messages involving the authenticated user', function () {
    $user = User::factory()->create();
    $stranger1 = User::factory()->create();
    $stranger2 = User::factory()->create();

    // Message between strangers — should NOT appear
    Message::factory()->create(['sender_id' => $stranger1->id, 'recipient_id' => $stranger2->id, 'content' => 'secret hello']);
    // Message involving user — should appear
    Message::factory()->create(['sender_id' => $user->id, 'recipient_id' => $stranger1->id, 'content' => 'hello world']);

    $response = $this->actingAs($user)
        ->getJson('/api/messages/search?q=hello')
        ->assertSuccessful();

    expect($response->json('data'))->toHaveCount(1);
});

test('search requires minimum 2 characters', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson('/api/messages/search?q=a')
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['q']);
});

test('search validates q field is required', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson('/api/messages/search')
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['q']);
});

test('search can be filtered by user_id', function () {
    $user = User::factory()->create();
    $target = User::factory()->create();
    $other = User::factory()->create();

    Message::factory()->create(['sender_id' => $user->id, 'recipient_id' => $target->id, 'content' => 'hello target']);
    Message::factory()->create(['sender_id' => $user->id, 'recipient_id' => $other->id, 'content' => 'hello other']);

    $response = $this->actingAs($user)
        ->getJson("/api/messages/search?q=hello&user_id={$target->id}")
        ->assertSuccessful();

    expect($response->json('data'))->toHaveCount(1)
        ->and($response->json('data.0.recipient_id'))->toBe($target->id);
});

test('search does not return soft-deleted messages', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();

    Message::factory()->create(['sender_id' => $user->id, 'recipient_id' => $other->id, 'content' => 'deleted hello', 'deleted_at' => now()]);

    $response = $this->actingAs($user)
        ->getJson('/api/messages/search?q=hello')
        ->assertSuccessful();

    expect($response->json('data'))->toHaveCount(0);
});
