<?php

use App\Models\User;

it('can visit the welcome page', function () {
    $page = visit('/');

    $page->assertSee('Log in')
        ->assertSee('Register');
});

it('can visit the login page', function () {
    $page = visit('/login');

    $page->assertSee('Email address')
        ->assertSee('Password')
        ->assertSee('Log in');
});

it('can login with valid credentials', function () {
    $user = User::factory()->create([
        'password' => bcrypt('password'),
    ]);

    $page = visit('/login');

    $page->fill('email', $user->email)
        ->fill('password', 'password')
        ->click('Log in')
        ->waitForText('Dashboard')
        ->assertPathIs('/dashboard')
        ->assertSee('Dashboard');
});

it('shows validation errors with invalid credentials', function () {
    $page = visit('/login');

    $page->fill('email', 'invalid@example.com')
        ->fill('password', 'wrong-password')
        ->click('Log in')
        ->waitForText('These credentials do not match our records');
});

it('can register a new account', function () {
    $page = visit('/register');

    $page->fill('name', 'Test User')
        ->fill('email', 'newuser@example.com')
        ->fill('password', 'password')
        ->fill('password_confirmation', 'password')
        ->click('Create account')
        ->waitForText('Dashboard')
        ->assertPathIs('/dashboard');
});
