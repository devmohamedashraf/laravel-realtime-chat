<?php

use App\Models\Message;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $userId = Auth::id();

        $totalMessages = Message::where('sender_id', $userId)
            ->orWhere('recipient_id', $userId)
            ->count();

        $sentCount = Message::where('sender_id', $userId)->count();
        $receivedCount = Message::where('recipient_id', $userId)->count();

        $conversationCount = Message::where('sender_id', $userId)
            ->orWhere('recipient_id', $userId)
            ->selectRaw('COUNT(DISTINCT IF(sender_id = ?, recipient_id, sender_id)) as total', [$userId])
            ->value('total');

        $unreadCount = Message::where('recipient_id', $userId)
            ->whereNull('read_at')
            ->count();

        $totalUsers = User::count();

        $recentConversations = Message::with(['sender:id,name,email,avatar_path', 'recipient:id,name,email,avatar_path'])
            ->where('sender_id', $userId)
            ->orWhere('recipient_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy(fn ($m) => $m->sender_id === $userId ? $m->recipient_id : $m->sender_id)
            ->take(5)
            ->map(function ($messages) use ($userId) {
                $last = $messages->first();
                $partner = $last->sender_id === $userId ? $last->recipient : $last->sender;

                return [
                    'user' => [
                        'id' => $partner->id,
                        'name' => $partner->name,
                        'email' => $partner->email,
                        'avatar_url' => $partner->avatar_url,
                    ],
                    'last_message' => $last->display_content,
                    'last_message_at' => $last->created_at->toISOString(),
                    'unread_count' => $messages->whereNull('read_at')->where('recipient_id', $userId)->count(),
                    'is_sender' => $last->sender_id === $userId,
                ];
            })
            ->values();

        $messagesPerDay = Message::where(function ($q) use ($userId) {
            $q->where('sender_id', $userId)->orWhere('recipient_id', $userId);
        })
            ->where('created_at', '>=', now()->subDays(7))
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return Inertia::render('dashboard', [
            'stats' => [
                'totalMessages' => $totalMessages,
                'sentCount' => $sentCount,
                'receivedCount' => $receivedCount,
                'conversationCount' => $conversationCount,
                'unreadCount' => $unreadCount,
                'totalUsers' => $totalUsers,
            ],
            'recentConversations' => $recentConversations,
            'messagesPerDay' => $messagesPerDay,
        ]);
    })->name('dashboard');

    Route::get('messages', function () {
        return Inertia::render('messages');
    })->name('messages');

    Route::get('users', function () {
        return Inertia::render('users');
    })->name('users');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
