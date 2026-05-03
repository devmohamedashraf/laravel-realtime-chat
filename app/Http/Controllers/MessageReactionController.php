<?php

namespace App\Http\Controllers;

use App\Events\MessageReactionToggled;
use App\Models\Message;
use App\Models\MessageReaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageReactionController extends Controller
{
    /**
     * Toggle a reaction on a message.
     */
    public function toggle(Request $request, Message $message): JsonResponse
    {
        $request->validate([
            'emoji' => 'required|string|max:10',
        ]);

        $userId = Auth::id();
        $emoji = $request->emoji;

        $existing = MessageReaction::where('message_id', $message->id)
            ->where('user_id', $userId)
            ->where('emoji', $emoji)
            ->first();

        if ($existing) {
            $existing->delete();
            $action = 'removed';
        } else {
            MessageReaction::create([
                'message_id' => $message->id,
                'user_id' => $userId,
                'emoji' => $emoji,
            ]);
            $action = 'added';
        }

        broadcast(new MessageReactionToggled($message, $emoji, $action, $userId))->toOthers();

        $reactions = MessageReaction::where('message_id', $message->id)
            ->get()
            ->groupBy('emoji')
            ->map(fn ($group) => [
                'emoji' => $group->first()->emoji,
                'count' => $group->count(),
                'user_ids' => $group->pluck('user_id'),
            ])
            ->values();

        return response()->json([
            'action' => $action,
            'reactions' => $reactions,
        ]);
    }
}
