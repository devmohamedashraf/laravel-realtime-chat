<?php

use App\Events\MessagesDelivered;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Support\Carbon;

it('broadcasts delivered messages on the expected private channel', function () {
    $deliveredAt = Carbon::parse('2026-04-17 21:05:49');
    $event = new MessagesDelivered([1, 2, 3], 7, 9, $deliveredAt);

    expect($event)
        ->toBeInstanceOf(ShouldBroadcast::class)
        ->and($event->broadcastAs())->toBe('message.delivered')
        ->and($event->broadcastOn())->toHaveCount(1)
        ->and($event->broadcastOn()[0])->toBeInstanceOf(PrivateChannel::class)
        ->and($event->broadcastOn()[0]->name)->toBe('private-chat.7')
        ->and($event->broadcastWith())->toBe([
            'message_ids' => [1, 2, 3],
            'recipient_id' => 9,
            'delivered_at' => $deliveredAt->toISOString(),
        ]);
});
