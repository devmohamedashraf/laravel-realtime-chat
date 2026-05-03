<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
});

test('guests cannot upload an avatar', function () {
    $file = UploadedFile::fake()->image('avatar.jpg');

    $this->postJson('/api/profile/avatar', ['avatar' => $file])
        ->assertUnauthorized();
});

test('authenticated user can upload an avatar', function () {
    $user = User::factory()->create();
    $file = UploadedFile::fake()->image('avatar.jpg', 100, 100);

    $response = $this->actingAs($user)
        ->postJson('/api/profile/avatar', ['avatar' => $file])
        ->assertSuccessful()
        ->assertJsonStructure(['avatar_url']);

    $user->refresh();
    expect($user->avatar_path)->not->toBeNull();
    Storage::disk('public')->assertExists($user->avatar_path);
});

test('uploading a new avatar replaces the old one', function () {
    $user = User::factory()->create();

    $firstFile = UploadedFile::fake()->image('first.jpg');
    $this->actingAs($user)->postJson('/api/profile/avatar', ['avatar' => $firstFile])->assertSuccessful();
    $user->refresh();
    $firstPath = $user->avatar_path;

    $secondFile = UploadedFile::fake()->image('second.jpg');
    $this->actingAs($user)->postJson('/api/profile/avatar', ['avatar' => $secondFile])->assertSuccessful();
    $user->refresh();

    expect($user->avatar_path)->not->toBe($firstPath);
    Storage::disk('public')->assertMissing($firstPath);
    Storage::disk('public')->assertExists($user->avatar_path);
});

test('avatar upload requires an image file', function () {
    $user = User::factory()->create();
    $file = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');

    $this->actingAs($user)
        ->postJson('/api/profile/avatar', ['avatar' => $file])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['avatar']);
});

test('avatar upload validates file size under 2MB', function () {
    $user = User::factory()->create();
    $file = UploadedFile::fake()->image('large.jpg')->size(3000); // 3MB

    $this->actingAs($user)
        ->postJson('/api/profile/avatar', ['avatar' => $file])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['avatar']);
});

test('avatar upload validates avatar field is required', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/api/profile/avatar', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['avatar']);
});

test('avatar url is included in user resource', function () {
    Storage::disk('public')->put('avatars/test.jpg', 'fake-content');
    $user = User::factory()->create(['avatar_path' => 'avatars/test.jpg']);

    $response = $this->actingAs($user)
        ->getJson('/api/users')
        ->assertSuccessful();

    $me = collect($response->json('data'))->firstWhere('id', $user->id);
    expect($me['avatar_url'])->not->toBeNull();
});
