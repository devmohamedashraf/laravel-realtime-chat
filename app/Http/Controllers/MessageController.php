<?php

namespace App\Http\Controllers;

use App\Events\MessageDeleted;
use App\Events\MessageEdited;
use App\Events\MessageRead;
use App\Events\MessageSent;
use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Models\Message;
use App\Models\User;
use App\Notifications\NewMessageNotification;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class MessageController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of messages.
     */
    public function index(Request $request, int $userId): JsonResponse
    {
        $perPage = (int) $request->get('per_page', 30);
        $before = $request->get('before'); // cursor: load messages before this ID

        $unreadMessages = Message::where('sender_id', $userId)
            ->where('recipient_id', Auth::id())
            ->whereNull('read_at')
            ->get(['id', 'sender_id', 'recipient_id', 'read_at']);

        if ($unreadMessages->isNotEmpty()) {
            $readAt = now();

            Message::whereIn('id', $unreadMessages->pluck('id'))
                ->update(['read_at' => $readAt]);

            foreach ($unreadMessages as $unreadMessage) {
                $unreadMessage->read_at = $readAt;
                broadcast(new MessageRead($unreadMessage));
            }
        }

        $query = Message::with('sender:id,name,email,avatar_path,last_seen_at', 'recipient:id,name,email,avatar_path,last_seen_at', 'reactions')
            ->where(function ($query) use ($userId) {
                $query->where(function ($q) use ($userId) {
                    $q->where('sender_id', Auth::id())
                        ->where('recipient_id', $userId);
                })->orWhere(function ($q) use ($userId) {
                    $q->where('sender_id', $userId)
                        ->where('recipient_id', Auth::id());
                });
            });

        if ($before) {
            $query->where('id', '<', $before);
        }

        $messages = $query->orderBy('id', 'desc')
            ->take($perPage + 1)
            ->get();

        $hasMore = $messages->count() > $perPage;
        $messages = $messages->take($perPage)->reverse()->values();

        return response()->json([
            'data' => MessageResource::collection($messages),
            'has_more' => $hasMore,
            'next_cursor' => $hasMore ? $messages->first()->id : null,
        ]);
    }

    /**
     * Store a newly created message in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'recipient_id' => 'required|exists:users,id',
            'content' => 'nullable|string|max:1000',
            'type' => 'nullable|string|in:text,image,file',
            'file' => 'nullable|file|max:10240|mimes:jpg,jpeg,png,gif,webp,pdf,doc,docx,txt,zip',
        ]);

        if (! $request->filled('content') && ! $request->hasFile('file')) {
            return response()->json(['message' => 'Either content or file is required.'], 422);
        }

        $attachmentData = [];
        $type = $request->input('type', 'text');

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('attachments', 'public');
            $mime = $file->getMimeType() ?? '';
            $type = str_starts_with($mime, 'image/') ? 'image' : 'file';

            $attachmentData = [
                'attachment_path' => $path,
                'attachment_name' => $file->getClientOriginalName(),
                'attachment_size' => $file->getSize(),
                'attachment_mime' => $mime,
            ];
        }

        $message = Message::create(array_merge([
            'sender_id' => Auth::id(),
            'recipient_id' => $request->recipient_id,
            'content' => $request->input('content', ''),
            'type' => $type,
        ], $attachmentData));

        $message->load('sender:id,name,email,avatar_path', 'recipient:id,name,email,avatar_path');

        $recipient = User::find($request->recipient_id);
        if ($recipient) {
            if ($recipient->last_seen_at && $recipient->last_seen_at->gt(now()->subMinutes(5))) {
                $message->update(['delivered_at' => now()]);
            }

            $recipient->notify(new NewMessageNotification($message, Auth::user()));
        }
        broadcast(new MessageSent($message));

        $message->fresh();

        Log::info('Message created', ['message' => $message]);

        return response()->json(new MessageResource($message), 201);
    }

    /**
     * Display the specified message.
     */
    public function show(Message $message): JsonResponse
    {
        $message->load('sender:id,name,email');

        return response()->json(new MessageResource($message));
    }

    /**
     * Update the specified message in storage.
     */
    public function update(Request $request, Message $message): JsonResponse
    {
        // Only allow the message owner to update
        $this->authorize('update', $message);

        $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $message->update([
            'content' => $request->content,
            'edited_at' => now(),
        ]);

        $message->load('sender:id,name,email');

        broadcast(new MessageEdited($message));

        return response()->json(new MessageResource($message));
    }

    /**
     * Remove the specified message from storage.
     */
    public function destroy(Message $message): JsonResponse
    {
        // Only allow the message owner to delete
        $this->authorize('delete', $message);

        $message->markAsDeleted();

        $message->load('sender:id,name,email');

        broadcast(new MessageDeleted($message));

        return response()->json(['message' => 'Message deleted successfully']);
    }

    /**
     * Mark a message as read.
     */
    public function markAsRead(Message $message): JsonResponse
    {
        if ($message->read_at !== null) {
            return response()->json(['message' => 'Message already marked as read']);
        }

        $message->markAsRead();
        broadcast(new MessageRead($message));

        return response()->json(['message' => 'Message marked as read']);
    }

    /**
     * Get unread messages count.
     */
    public function unreadCount(): JsonResponse
    {
        $count = Message::unread()->count();

        return response()->json(['count' => $count]);
    }

    /**
     * Get conversations for the authenticated user (for sidebar).
     */
    public function conversations(Request $request): JsonResponse
    {
        $conversations = Message::with(['sender:id,name,email,avatar_path,last_seen_at', 'recipient:id,name,email,avatar_path,last_seen_at'])
            ->where(function ($query) {
                $query->where('sender_id', Auth::id())
                    ->orWhere('recipient_id', Auth::id());
            })
            ->orderByDesc('id')
            ->get()
            ->groupBy(function ($message) {
                return $message->sender_id === Auth::id() ? $message->recipient_id : $message->sender_id;
            })
            ->map(function ($messages) {
                $sortedMessages = $messages->sortBy('id')->values();
                $lastMessage = $sortedMessages->last();
                $otherUser = $lastMessage->sender_id === Auth::id() ? $lastMessage->recipient : $lastMessage->sender;

                return [
                    'user' => $otherUser,
                    'messages' => $sortedMessages,
                    'unread_count' => $sortedMessages->whereNull('read_at')->where('recipient_id', Auth::id())->count(),
                    'is_sender' => $lastMessage->sender_id === Auth::id(),
                    'last_message' => $lastMessage,
                ];
            })
            ->sortByDesc(fn (array $conversation) => $conversation['last_message']->id)
            ->values();

        return response()->json(ConversationResource::collection($conversations));
    }

    /**
     * Get messages for a specific user (conversation between authenticated user and specified user).
     */
    public function userMessages(Request $request, int $userId): JsonResponse
    {
        $messages = Message::with('sender:id,name,email', 'recipient:id,name,email')
            ->where(function ($query) use ($userId) {
                $query->where(function ($q) use ($userId) {
                    $q->where('sender_id', Auth::id())
                        ->where('recipient_id', $userId);
                })->orWhere(function ($q) use ($userId) {
                    $q->where('sender_id', $userId)
                        ->where('recipient_id', Auth::id());
                });
            })
            ->orderBy('created_at', 'asc')
            ->paginate($request->get('per_page', 50));

        return response()->json(MessageResource::collection($messages));
    }
}
