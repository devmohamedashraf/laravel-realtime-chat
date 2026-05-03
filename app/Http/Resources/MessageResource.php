<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sender_id' => $this->sender_id,
            'recipient_id' => $this->recipient_id,
            'content' => $this->display_content,
            'type' => $this->type,
            'attachment' => $this->attachment_path ? [
                'url' => $this->attachment_url,
                'name' => $this->attachment_name,
                'size' => $this->attachment_size,
                'mime' => $this->attachment_mime,
            ] : null,
            'sender' => [
                'id' => $this->sender->id,
                'name' => $this->sender->name,
                'email' => $this->sender->email,
                'avatar_url' => $this->sender->avatar_url,
            ],
            'recipient' => [
                'id' => $this->recipient->id,
                'name' => $this->recipient->name,
                'email' => $this->recipient->email,
                'avatar_url' => $this->recipient->avatar_url,
            ],
            'reactions' => $this->whenLoaded('reactions', function () {
                return $this->reactions
                    ->groupBy('emoji')
                    ->map(fn ($group) => [
                        'emoji' => $group->first()->emoji,
                        'count' => $group->count(),
                        'user_ids' => $group->pluck('user_id'),
                    ])
                    ->values();
            }, []),
            'delivered_at' => $this->delivered_at,
            'read_at' => $this->read_at,
            'edited_at' => $this->edited_at,
            'deleted_at' => $this->deleted_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
