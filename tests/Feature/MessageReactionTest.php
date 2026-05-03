<?php

use App\Events\MessageReactionToggled;
use App\Models\Message;
use App\Models\MessageReaction;
use App\Models\User;
use Illuminate\Support\Facades\Event;

test('guests cannot toggle reactions', function () {
    $message = Message::factory()->create();

    $this->postJson("/api/messages/{$message->id}/reactions", ['emoji' => '👍'])
        ->assertUnauthorized();
});

test('authenticated user can add a reaction', function () {
    $user = User::factory()->create();
    $message = Message::factory()->create(['recipient_id' => $user->id]);

    $this->actingAs($user)
        ->postJson("/api/messages/{$message->id}/reactions", ['emoji' => '👍'])
        ->assertSuccessful()
        ->assertJsonPath('action', 'added');

    expect(MessageReaction::where('message_id', $message->id)->where('emoji', '👍')->exists())->toBeTrue();
});

test('toggling an existing reaction removes it', function () {
    $user = User::factory()->create();
    $message = Message::factory()->create(['recipient_id' => $user->id]);

    MessageReaction::create([
        'message_id' => $message->id,
        'user_id' => $user->id,
        'emoji' => '👍',
    ]);

    $this->actingAs($user)
        ->postJson("/api/messages/{$message->id}/reactions", ['emoji' => '👍'])
        ->assertSuccessful()
        ->assertJsonPath('action', 'removed');

    expect(MessageReaction::where('message_id', $message->id)->where('emoji', '👍')->where('user_id', $user->id)->exists())->toBeFalse();
});

test('reaction response includes grouped reactions', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $message = Message::factory()->create(['sender_id' => $user->id, 'recipient_id' => $other->id]);

    MessageReaction::create(['message_id' => $message->id, 'user_id' => $other->id, 'emoji' => '👍']);

    $response = $this->actingAs($user)
        ->postJson("/api/messages/{$message->id}/reactions", ['emoji' => '👍'])
        ->assertSuccessful();

    $reactions = $response->json('reactions');
    expect($reactions)->not->toBeEmpty();
    $thumbs = collect($reactions)->firstWhere('emoji', '👍');
    expect($thumbs['count'])->toBe(2);
});

test('reaction requires emoji field', function () {
    $user = User::factory()->create();
    $message = Message::factory()->create(['recipient_id' => $user->id]);

    $this->actingAs($user)
        ->postJson("/api/messages/{$message->id}/reactions", [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['emoji']);
});

test('reaction broadcasts message reaction toggled event', function () {
    Event::fake();

    $user = User::factory()->create();
    $message = Message::factory()->create(['recipient_id' => $user->id]);

    $this->actingAs($user)
        ->postJson("/api/messages/{$message->id}/reactions", ['emoji' => '❤️'])
        ->assertSuccessful();

    Event::assertDispatched(MessageReactionToggled::class);
});

test('different users can react with same emoji', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();
    $message = Message::factory()->create(['sender_id' => $user1->id, 'recipient_id' => $user2->id]);

    $this->actingAs($user1)->postJson("/api/messages/{$message->id}/reactions", ['emoji' => '😂'])->assertSuccessful();
    $this->actingAs($user2)->postJson("/api/messages/{$message->id}/reactions", ['emoji' => '😂'])->assertSuccessful();

    expect(MessageReaction::where('message_id', $message->id)->where('emoji', '😂')->count())->toBe(2);
});
