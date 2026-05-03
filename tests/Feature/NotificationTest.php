<?php

use App\Models\Message;
use App\Models\User;
use App\Notifications\NewMessageNotification;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;

function createDatabaseNotification(User $user, array $overrides = []): DatabaseNotification
{
    return DatabaseNotification::create(array_merge([
        'id' => Str::uuid(),
        'type' => 'message.received',
        'notifiable_type' => User::class,
        'notifiable_id' => $user->id,
        'data' => ['title' => 'Test User', 'body' => 'Hello there!', 'sender_id' => 999, 'sender_name' => 'Test User', 'message_id' => 1],
    ], $overrides));
}

test('guests cannot access notifications', function () {
    $this->getJson('/api/notifications')->assertUnauthorized();
});

test('authenticated user can fetch their notifications', function () {
    $user = User::factory()->create();

    createDatabaseNotification($user);

    $this->actingAs($user)
        ->getJson('/api/notifications')
        ->assertSuccessful()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.type', 'message.received')
        ->assertJsonPath('data.0.title', 'Test User');
});

test('user only sees their own notifications', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    createDatabaseNotification($otherUser, ['data' => ['title' => 'Not mine', 'body' => 'Secret']]);
    createDatabaseNotification($user, ['data' => ['title' => 'Mine', 'body' => 'Hello!']]);

    $this->actingAs($user)
        ->getJson('/api/notifications')
        ->assertSuccessful()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.title', 'Mine');
});

test('user can get unread notification count', function () {
    $user = User::factory()->create();

    createDatabaseNotification($user);
    createDatabaseNotification($user, ['read_at' => now()]);

    $this->actingAs($user)
        ->getJson('/api/notifications/unread/count')
        ->assertSuccessful()
        ->assertJsonPath('count', 1);
});

test('user can mark a notification as read', function () {
    $user = User::factory()->create();

    $notification = createDatabaseNotification($user);

    expect($notification->read_at)->toBeNull();

    $this->actingAs($user)
        ->patchJson("/api/notifications/{$notification->id}/read")
        ->assertSuccessful();

    expect($notification->fresh()->read_at)->not->toBeNull();
});

test('user cannot mark another users notification as read', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $notification = createDatabaseNotification($otherUser);

    $this->actingAs($user)
        ->patchJson("/api/notifications/{$notification->id}/read")
        ->assertNotFound();
});

test('user can mark all notifications as read', function () {
    $user = User::factory()->create();

    createDatabaseNotification($user);
    createDatabaseNotification($user);

    $this->actingAs($user)
        ->postJson('/api/notifications/read-all')
        ->assertSuccessful();

    expect($user->unreadNotifications()->count())->toBe(0);
});

test('user can delete a notification', function () {
    $user = User::factory()->create();

    $notification = createDatabaseNotification($user);

    $this->actingAs($user)
        ->deleteJson("/api/notifications/{$notification->id}")
        ->assertSuccessful();

    expect(DatabaseNotification::find($notification->id))->toBeNull();
});

test('user cannot delete another users notification', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $notification = createDatabaseNotification($otherUser);

    $this->actingAs($user)
        ->deleteJson("/api/notifications/{$notification->id}")
        ->assertNotFound();
});

test('sending a message dispatches NewMessageNotification to recipient', function () {
    Notification::fake();

    $sender = User::factory()->create();
    $recipient = User::factory()->create();

    $this->actingAs($sender)
        ->postJson('/api/messages', [
            'recipient_id' => $recipient->id,
            'content' => 'Hey, how are you?',
        ])
        ->assertCreated();

    Notification::assertSentTo(
        $recipient,
        NewMessageNotification::class,
        function (NewMessageNotification $notification) use ($sender) {
            return $notification->sender->id === $sender->id
                && $notification->message->content === 'Hey, how are you?';
        }
    );
});

test('notification toArray returns correct data structure', function () {
    $sender = User::factory()->create();
    $recipient = User::factory()->create();

    $message = Message::create([
        'sender_id' => $sender->id,
        'recipient_id' => $recipient->id,
        'content' => 'Test message',
        'type' => 'text',
    ]);

    $notification = new NewMessageNotification($message, $sender);
    $data = $notification->toArray($recipient);

    expect($data)->toMatchArray([
        'title' => $sender->name,
        'body' => 'Test message',
        'message_id' => $message->id,
        'sender_id' => $sender->id,
        'sender_name' => $sender->name,
    ]);
});

test('notification uses database and broadcast channels', function () {
    $sender = User::factory()->create();
    $recipient = User::factory()->create();

    $message = Message::create([
        'sender_id' => $sender->id,
        'recipient_id' => $recipient->id,
        'content' => 'Channel test',
        'type' => 'text',
    ]);

    $notification = new NewMessageNotification($message, $sender);

    expect($notification->via($recipient))->toBe(['database', 'broadcast']);
    expect($notification->databaseType($recipient))->toBe('message.received');
    expect($notification->broadcastType())->toBe('message.received');
});
