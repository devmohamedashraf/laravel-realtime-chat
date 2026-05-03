<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageReactionToggled implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly Message $message,
        public readonly string $emoji,
        public readonly string $action,
        public readonly int $userId,
    ) {}

    /** @return array<int, Channel> */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('chat.'.$this->message->sender_id),
            new PrivateChannel('chat.'.$this->message->recipient_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'message.reaction.toggled';
    }

    /** @return array<string, mixed> */
    public function broadcastWith(): array
    {
        $reactions = $this->message->reactions()
            ->get()
            ->groupBy('emoji')
            ->map(fn ($group) => [
                'emoji' => $group->first()->emoji,
                'count' => $group->count(),
                'user_ids' => $group->pluck('user_id'),
            ])
            ->values();

        return [
            'message_id' => $this->message->id,
            'emoji' => $this->emoji,
            'action' => $this->action,
            'user_id' => $this->userId,
            'reactions' => $reactions,
        ];
    }
}
