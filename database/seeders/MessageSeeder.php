<?php

namespace Database\Seeders;

use App\Models\Message;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class MessageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        $userIds = $users->pluck('id')->toArray();

        if (count($userIds) < 2) {
            return; // Need at least 2 users for conversations
        }

        // Create various conversation scenarios
        $this->createShortConversations($userIds);
        $this->createLongConversations($userIds);
    }

    /**
     * Create short conversations (2-5 messages)
     */
    private function createShortConversations(array $userIds): void
    {
        $shortConversationTemplates = [
            [
                ['user' => 0, 'recipient' => 1, 'content' => 'Hey, how are you doing?', 'delay' => 0],
                ['user' => 1, 'recipient' => 0, 'content' => 'I\'m good! Just working on some projects. You?', 'delay' => 5],
                ['user' => 0, 'recipient' => 1, 'content' => 'Same here. Want to grab coffee later?', 'delay' => 2],
                ['user' => 1, 'recipient' => 0, 'content' => 'Sure! How about 3 PM?', 'delay' => 1],
            ],
            [
                ['user' => 2, 'recipient' => 3, 'content' => 'Did you see the new movie trailer?', 'delay' => 0],
                ['user' => 3, 'recipient' => 2, 'content' => 'Not yet! Is it good?', 'delay' => 10],
                ['user' => 2, 'recipient' => 3, 'content' => 'Yeah, looks amazing!', 'delay' => 3],
            ],
            [
                ['user' => 4, 'recipient' => 5, 'content' => 'Happy birthday! 🎉', 'delay' => 0],
                ['user' => 5, 'recipient' => 4, 'content' => 'Thank you so much! 😊', 'delay' => 30],
            ],
        ];

        foreach ($shortConversationTemplates as $template) {
            $this->createConversationFromTemplate($template, $userIds, now()->subDays(rand(1, 30)));
        }
    }

    /**
     * Create long conversations (10-20 messages)
     */
    private function createLongConversations(array $userIds): void
    {
        $longConversationTemplates = [
            // Work discussion
            [
                ['user' => 0, 'recipient' => 6, 'content' => 'Hey, I was thinking about that project we discussed last week.', 'delay' => 0],
                ['user' => 6, 'recipient' => 0, 'content' => 'Oh yeah! The one with the new API integration?', 'delay' => 15],
                ['user' => 0, 'recipient' => 6, 'content' => 'Exactly. I think we should start with the authentication layer first.', 'delay' => 5],
                ['user' => 6, 'recipient' => 0, 'content' => 'Agreed. Have you looked at the documentation for the OAuth implementation?', 'delay' => 20],
                ['user' => 0, 'recipient' => 6, 'content' => 'Yes, it seems straightforward. We might need to handle token refresh though.', 'delay' => 10],
                ['user' => 6, 'recipient' => 0, 'content' => 'Good point. Let\'s schedule a meeting to discuss the architecture.', 'delay' => 8],
                ['user' => 0, 'recipient' => 6, 'content' => 'How about tomorrow at 2 PM? I can share my screen with the current codebase.', 'delay' => 12],
                ['user' => 6, 'recipient' => 0, 'content' => 'Perfect! I\'ll prepare some questions about the database schema.', 'delay' => 6],
                ['user' => 0, 'recipient' => 6, 'content' => 'Great. Also, I think we should consider using Redis for caching the tokens.', 'delay' => 25],
                ['user' => 6, 'recipient' => 0, 'content' => 'That makes sense for performance. I\'ll research the best practices.', 'delay' => 18],
                ['user' => 0, 'recipient' => 6, 'content' => 'Thanks! Looking forward to our discussion.', 'delay' => 5],
                ['user' => 6, 'recipient' => 0, 'content' => 'Me too. This is going to be an interesting project!', 'delay' => 3],
            ],
            // Travel planning
            [
                ['user' => 1, 'recipient' => 7, 'content' => 'I\'m thinking about planning a trip to Europe next summer. Any recommendations?', 'delay' => 0],
                ['user' => 7, 'recipient' => 1, 'content' => 'That sounds amazing! Paris and Rome are must-visits.', 'delay' => 20],
                ['user' => 1, 'recipient' => 7, 'content' => 'I\'ve heard Paris is beautiful. What about accommodation?', 'delay' => 15],
                ['user' => 7, 'recipient' => 1, 'content' => 'Airbnb is great for the city center. Book early though!', 'delay' => 12],
                ['user' => 1, 'recipient' => 7, 'content' => 'Good tip. How long should I plan for the trip?', 'delay' => 8],
                ['user' => 7, 'recipient' => 1, 'content' => 'At least 2 weeks to see both countries properly.', 'delay' => 25],
                ['user' => 1, 'recipient' => 7, 'content' => 'That makes sense. What about transportation between cities?', 'delay' => 18],
                ['user' => 7, 'recipient' => 1, 'content' => 'Train is the best way. Eurail pass is worth it for multiple destinations.', 'delay' => 30],
                ['user' => 1, 'recipient' => 7, 'content' => 'Thanks for the advice! I\'ll start researching flights.', 'delay' => 10],
                ['user' => 7, 'recipient' => 1, 'content' => 'You\'re welcome! Send me pics when you go! 📸', 'delay' => 5],
            ],
        ];

        foreach ($longConversationTemplates as $template) {
            $this->createConversationFromTemplate($template, $userIds, now()->subDays(rand(1, 60)));
        }
    }

    /**
     * Create a conversation from a template
     */
    private function createConversationFromTemplate(array $template, array $userIds, Carbon $baseTime): void
    {
        $currentTime = $baseTime->copy();
        $totalDelay = 0;

        foreach ($template as $messageData) {
            $totalDelay += $messageData['delay'];
            $messageTime = $currentTime->copy()->addMinutes($totalDelay);

            // Ensure we have valid user IDs
            $senderId = $userIds[$messageData['user']] ?? $userIds[0];
            $recipientId = $userIds[$messageData['recipient']] ?? $userIds[1];

            Message::create([
                'sender_id' => $senderId,
                'recipient_id' => $recipientId,
                'content' => $messageData['content'],
                'type' => 'text',
                'delivered_at' => $messageTime,
                'read_at' => rand(0, 1) ? $messageTime->copy()->addMinutes(rand(1, 30)) : null,
            ]);
        }
    }
}
