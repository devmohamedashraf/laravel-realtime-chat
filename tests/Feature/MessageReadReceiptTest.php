<?php

use App\Events\MessageRead;
use App\Models\Message;
use App\Models\User;
use Illuminate\Support\Facades\Event;

test('opening a conversation marks unread messages as read and broadcasts read events', function () {
    Event::fake([MessageRead::class]);

    /** @var User $recipient */
    $recipient = User::factory()->createOne();
    /** @var User $sender */
    $sender = User::factory()->createOne();

    $firstUnreadMessage = Message::factory()->create([
        'sender_id' => $sender->id,
        'recipient_id' => $recipient->id,
        'read_at' => null,
    ]);

    $secondUnreadMessage = Message::factory()->create([
        'sender_id' => $sender->id,
        'recipient_id' => $recipient->id,
        'read_at' => null,
    ]);

    Message::factory()->create([
        'sender_id' => $sender->id,
        'recipient_id' => $recipient->id,
        'read_at' => now(),
    ]);

    $this->actingAs($recipient)
        ->getJson("/api/users/{$sender->id}/messages")
        ->assertSuccessful();

    expect($firstUnreadMessage->fresh()->read_at)->not->toBeNull()
        ->and($secondUnreadMessage->fresh()->read_at)->not->toBeNull();

    Event::assertDispatchedTimes(MessageRead::class, 2);
    Event::assertDispatched(MessageRead::class, fn (MessageRead $event) => $event->message->id === $firstUnreadMessage->id);
    Event::assertDispatched(MessageRead::class, fn (MessageRead $event) => $event->message->id === $secondUnreadMessage->id);
});

test('opening a conversation with no unread messages does not broadcast read events', function () {
    Event::fake([MessageRead::class]);

    /** @var User $recipient */
    $recipient = User::factory()->createOne();
    /** @var User $sender */
    $sender = User::factory()->createOne();

    Message::factory()->create([
        'sender_id' => $sender->id,
        'recipient_id' => $recipient->id,
        'read_at' => now(),
    ]);

    $this->actingAs($recipient)
        ->getJson("/api/users/{$sender->id}/messages")
        ->assertSuccessful();

    Event::assertNotDispatched(MessageRead::class);
});
