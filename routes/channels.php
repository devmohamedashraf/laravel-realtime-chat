<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('chat.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('online', function ($user) {
    return ['id' => $user->id, 'name' => $user->name];
});

// Typing indicator channel — both conversation participants can join
Broadcast::channel('typing.{userId1}-{userId2}', function ($user, $userId1, $userId2) {
    return Auth::check() && ((int) $user->id === (int) $userId1 || (int) $user->id === (int) $userId2);
});
