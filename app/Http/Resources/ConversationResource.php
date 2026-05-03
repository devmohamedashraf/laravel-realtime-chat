<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ConversationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'user' => [
                'id' => $this->resource['user']->id,
                'name' => $this->resource['user']->name,
                'email' => $this->resource['user']->email,
                'avatar_url' => $this->resource['user']->avatar_path ? Storage::url($this->resource['user']->avatar_path) : null,
                'last_seen_at' => $this->resource['user']->last_seen_at?->toISOString(),
            ],
            'messages' => MessageResource::collection($this->resource['messages']),
            'unread_count' => $this->resource['unread_count'],
            'is_sender' => $this->resource['is_sender'] ?? false,
            'last_message' => new MessageResource($this->resource['last_message'] ?? null),
        ];
    }
}
