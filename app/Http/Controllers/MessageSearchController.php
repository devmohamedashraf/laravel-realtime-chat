<?php

namespace App\Http\Controllers;

use App\Http\Resources\MessageResource;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageSearchController extends Controller
{
    /**
     * Search messages by content.
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'q' => 'required|string|min:2|max:100',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $query = $request->string('q')->toString();
        $userId = Auth::id();

        $messages = Message::with('sender:id,name,email,avatar_path', 'recipient:id,name,email,avatar_path')
            ->where(function ($q) use ($userId) {
                $q->where('sender_id', $userId)
                    ->orWhere('recipient_id', $userId);
            })
            ->when($request->user_id, function ($q, $peerId) use ($userId) {
                $q->where(function ($inner) use ($userId, $peerId) {
                    $inner->where('sender_id', $userId)->where('recipient_id', $peerId);
                })->orWhere(function ($inner) use ($userId, $peerId) {
                    $inner->where('sender_id', $peerId)->where('recipient_id', $userId);
                });
            })
            ->whereNull('deleted_at')
            ->where('content', 'like', '%'.$query.'%')
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        return response()->json([
            'data' => MessageResource::collection($messages),
        ]);
    }
}
