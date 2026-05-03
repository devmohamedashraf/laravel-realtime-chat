<?php

use App\Models\Message;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
});

test('guests cannot send messages with attachments', function () {
    $recipient = User::factory()->create();
    $file = UploadedFile::fake()->image('photo.jpg');

    $this->postJson('/api/messages', [
        'recipient_id' => $recipient->id,
        'file' => $file,
    ])->assertUnauthorized();
});

test('user can send an image attachment', function () {
    $user = User::factory()->create();
    $recipient = User::factory()->create();
    $file = UploadedFile::fake()->image('photo.jpg', 200, 200);

    $response = $this->actingAs($user)
        ->postJson('/api/messages', [
            'recipient_id' => $recipient->id,
            'file' => $file,
        ])
        ->assertSuccessful()
        ->assertJsonStructure(['attachment' => ['url', 'name', 'size', 'mime']]);

    $message = Message::latest()->first();
    expect($message->type)->toBe('image')
        ->and($message->attachment_path)->not->toBeNull()
        ->and($message->attachment_name)->toBe('photo.jpg');

    Storage::disk('public')->assertExists($message->attachment_path);
});

test('user can send a file attachment', function () {
    $user = User::factory()->create();
    $recipient = User::factory()->create();
    $file = UploadedFile::fake()->create('document.pdf', 500, 'application/pdf');

    $response = $this->actingAs($user)
        ->postJson('/api/messages', [
            'recipient_id' => $recipient->id,
            'file' => $file,
        ])
        ->assertSuccessful();

    $message = Message::latest()->first();
    expect($message->type)->toBe('file')
        ->and($message->attachment_mime)->toBe('application/pdf');
});

test('message with attachment has attachment object in resource', function () {
    $user = User::factory()->create();
    Storage::disk('public')->put('attachments/test.pdf', 'fake-content');
    $message = Message::factory()->withAttachment()->create([
        'sender_id' => $user->id,
    ]);

    $response = $this->actingAs($user)
        ->getJson("/api/users/{$message->recipient_id}/messages")
        ->assertSuccessful();

    $found = collect($response->json('data'))->firstWhere('id', $message->id);
    expect($found['attachment'])->not->toBeNull()
        ->and($found['attachment']['name'])->toBe('test-file.pdf');
});

test('text message attachment is null', function () {
    $user = User::factory()->create();
    $message = Message::factory()->create(['sender_id' => $user->id]);

    $response = $this->actingAs($user)
        ->getJson("/api/users/{$message->recipient_id}/messages")
        ->assertSuccessful();

    $found = collect($response->json('data'))->firstWhere('id', $message->id);
    expect($found['attachment'])->toBeNull();
});

test('file upload rejects disallowed mime types', function () {
    $user = User::factory()->create();
    $recipient = User::factory()->create();
    $file = UploadedFile::fake()->create('script.exe', 100, 'application/x-msdownload');

    $this->actingAs($user)
        ->postJson('/api/messages', [
            'recipient_id' => $recipient->id,
            'file' => $file,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['file']);
});

test('file upload rejects files larger than 10MB', function () {
    $user = User::factory()->create();
    $recipient = User::factory()->create();
    $file = UploadedFile::fake()->create('large.pdf', 11000, 'application/pdf');

    $this->actingAs($user)
        ->postJson('/api/messages', [
            'recipient_id' => $recipient->id,
            'file' => $file,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['file']);
});

test('message requires either content or file', function () {
    $user = User::factory()->create();
    $recipient = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/api/messages', [
            'recipient_id' => $recipient->id,
        ])
        ->assertUnprocessable();
});
