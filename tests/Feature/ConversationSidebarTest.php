<?php

use App\Models\Message;
use App\Models\User;

it('returns conversations sorted by latest message with correct last_message payload', function () {
    /** @var User $currentUser */
    $currentUser = User::factory()->createOne();
    /** @var User $alice */
    $alice = User::factory()->createOne();
    /** @var User $bob */
    $bob = User::factory()->createOne();

    $olderAliceMessage = Message::factory()->create([
        'sender_id' => $currentUser->id,
        'recipient_id' => $alice->id,
        'content' => 'Alice old',
    ]);

    $bobMessage = Message::factory()->create([
        'sender_id' => $bob->id,
        'recipient_id' => $currentUser->id,
        'content' => 'Bob latest',
    ]);

    $latestAliceMessage = Message::factory()->create([
        'sender_id' => $alice->id,
        'recipient_id' => $currentUser->id,
        'content' => 'Alice newest',
    ]);

    $response = $this->actingAs($currentUser)->getJson('/api/conversations')->assertSuccessful();

    $payload = $response->json();
    $conversations = array_is_list($payload) ? $payload : ($payload['data'] ?? []);

    expect($conversations)->toHaveCount(2)
        ->and($conversations[0]['user']['id'])->toBe($alice->id)
        ->and($conversations[0]['last_message']['id'])->toBe($latestAliceMessage->id)
        ->and($conversations[0]['last_message']['content'])->toBe('Alice newest')
        ->and($conversations[1]['user']['id'])->toBe($bob->id)
        ->and($conversations[1]['last_message']['id'])->toBe($bobMessage->id);

    $aliceConversation = collect($conversations)->firstWhere('user.id', $alice->id);

    expect($aliceConversation)->not->toBeNull()
        ->and($aliceConversation['messages'][0]['id'])->toBe($olderAliceMessage->id)
        ->and(collect($aliceConversation['messages'])->last()['id'])->toBe($latestAliceMessage->id);
});
