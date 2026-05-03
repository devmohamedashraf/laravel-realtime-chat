<?php

use App\Models\Message;
use App\Models\User;

it('can navigate to the messages page', function () {
    $user = User::factory()->create(['password' => bcrypt('password')]);

    $page = visit('/login');

    $page->fill('email', $user->email)
        ->fill('password', 'password')
        ->click('Log in')
        ->waitForText('Dashboard')
        ->click('Messages')
        ->waitForText('Select a conversation')
        ->assertPathIs('/messages');
});

it('shows conversation sidebar with chats label', function () {
    $user = User::factory()->create(['password' => bcrypt('password')]);
    $partner = User::factory()->create();
    Message::factory()->create([
        'sender_id' => $partner->id,
        'recipient_id' => $user->id,
        'content' => 'Hello from browser test',
    ]);

    $page = visit('/login');

    $page->fill('email', $user->email)
        ->fill('password', 'password')
        ->click('Log in')
        ->waitForText('Dashboard')
        ->click('Messages')
        ->waitForText('Chats')
        ->assertSee($partner->name);
});

it('can view the dashboard with stats', function () {
    $user = User::factory()->create(['password' => bcrypt('password')]);
    $partner = User::factory()->create();
    Message::factory()->count(3)->create([
        'sender_id' => $user->id,
        'recipient_id' => $partner->id,
    ]);

    $page = visit('/login');

    $page->fill('email', $user->email)
        ->fill('password', 'password')
        ->click('Log in')
        ->waitForText('Dashboard')
        ->assertSee('Total Messages')
        ->assertSee('Messages Sent');
});

it('shows no javascript errors on the messages page', function () {
    $user = User::factory()->create(['password' => bcrypt('password')]);

    $page = visit('/login');

    $page->fill('email', $user->email)
        ->fill('password', 'password')
        ->click('Log in')
        ->waitForText('Dashboard')
        ->click('Messages')
        ->waitForText('Select a conversation')
        ->assertNoJavaScriptErrors();
});
