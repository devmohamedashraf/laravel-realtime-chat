<?php

namespace App\Http\Middleware;

use App\Events\MessagesDelivered;
use App\Models\Message;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleLastSeenAt
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            $wasOffline = ! $user->last_seen_at || $user->last_seen_at->diffInMinutes(now()) > 5;

            $user->update(['last_seen_at' => now()]);

            if ($wasOffline) {
                $this->deliverPendingMessages($user);
            }
        }

        return $next($request);
    }

    /**
     * Deliver messages that were sent while the user was offline.
     */
    private function deliverPendingMessages($user): void
    {
        $pendingMessages = Message::where('recipient_id', $user->id)
            ->whereNull('delivered_at')
            ->get();

        if ($pendingMessages->isEmpty()) {
            return;
        }

        $now = now();

        // Update all messages as delivered
        Message::whereIn('id', $pendingMessages->pluck('id'))
            ->update(['delivered_at' => $now]);

        // Group messages by sender to notify each sender ONCE
        $messagesBySender = $pendingMessages->groupBy('sender_id');

        foreach ($messagesBySender as $senderId => $messages) {
            // One notification per sender with all their message IDs
            broadcast(new MessagesDelivered(
                $messages->pluck('id')->toArray(), // Array of message IDs
                $senderId,
                $user->id,
                $now
            ));
        }
    }
}
