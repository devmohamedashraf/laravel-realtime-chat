<?php

use App\Http\Controllers\MessageController;
use App\Http\Controllers\MessageReactionController;
use App\Http\Controllers\MessageSearchController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OnlineUserController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware(['auth:sanctum'])->group(function () {
    // Messages routes
    Route::prefix('messages')->group(function () {
        Route::get('/', [MessageController::class, 'index'])->name('messages.index');
        Route::post('/', [MessageController::class, 'store'])->middleware('throttle:60,1')->name('messages.store');
        Route::patch('{message}', [MessageController::class, 'update'])->name('messages.update');
        Route::delete('{message}', [MessageController::class, 'destroy'])->name('messages.destroy');
    });

    // Additional message routes
    Route::patch('messages/{message}/read', [MessageController::class, 'markAsRead'])->name('messages.read');
    Route::get('messages/unread/count', [MessageController::class, 'unreadCount'])->name('messages.unread.count');
    Route::get('messages/search', [MessageSearchController::class, 'search'])->name('messages.search');
    Route::get('conversations', [MessageController::class, 'conversations'])->name('conversations');
    Route::get('users/{user}/messages', [MessageController::class, 'index'])->name('users.messages');

    // Message reactions
    Route::post('messages/{message}/reactions', [MessageReactionController::class, 'toggle'])
        ->middleware('throttle:120,1')
        ->name('messages.reactions.toggle');

    // Notifications routes
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('notifications.index');
        Route::get('unread/count', [NotificationController::class, 'unreadCount'])->name('notifications.unread.count');
        Route::patch('{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
        Route::post('read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read.all');
        Route::delete('{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
    });

    // Users route
    Route::get('users', function () {
        return \App\Http\Resources\UserResource::collection(
            \App\Models\User::select('id', 'name', 'email', 'avatar_path', 'last_seen_at')->get()
        );
    })->name('users.index');

    // Avatar upload
    Route::post('profile/avatar', [ProfileController::class, 'uploadAvatar'])
        ->middleware('throttle:10,1')
        ->name('profile.avatar');

    // Heartbeat to keep last_seen_at current
    Route::post('heartbeat', function (Request $request) {
        $request->user()->update(['last_seen_at' => now()]);
        return response()->json(['ok' => true]);
    })->middleware('throttle:60,1')->name('heartbeat');

    // Get online users (polling)
    Route::get('online-users', [OnlineUserController::class, 'index'])->name('online-users');
});
