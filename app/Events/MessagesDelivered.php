<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;

class MessagesDelivered implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @param  array<int, int>  $messageIds
     */
    public array $messageIds;

    public int $senderId;

    public int $recipientId;

    public Carbon $deliveredAt;

    /**
     * Create a new event instance.
     *
     * @param  array<int, int>  $messageIds
     */
    public function __construct(array $messageIds, int $senderId, int $recipientId, Carbon $deliveredAt)
    {
        $this->messageIds = $messageIds;
        $this->senderId = $senderId;
        $this->recipientId = $recipientId;
        $this->deliveredAt = $deliveredAt;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('chat.'.$this->senderId),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'message.delivered';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'message_ids' => $this->messageIds,
            'recipient_id' => $this->recipientId,
            'delivered_at' => $this->deliveredAt->toISOString(),
        ];
    }
}
