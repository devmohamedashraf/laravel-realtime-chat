<?php

namespace Database\Factories;

use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Message>
 */
class MessageFactory extends Factory
{
    public function definition(): array
    {
        return [
            'sender_id' => User::factory(),
            'recipient_id' => User::factory(),
            'content' => fake()->sentence(),
            'type' => 'text',
        ];
    }

    public function withAttachment(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'file',
            'content' => null,
            'attachment_path' => 'attachments/test-file.pdf',
            'attachment_name' => 'test-file.pdf',
            'attachment_size' => 1024,
            'attachment_mime' => 'application/pdf',
        ]);
    }

    public function image(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'image',
            'content' => null,
            'attachment_path' => 'attachments/test-image.jpg',
            'attachment_name' => 'test-image.jpg',
            'attachment_size' => 2048,
            'attachment_mime' => 'image/jpeg',
        ]);
    }
}
