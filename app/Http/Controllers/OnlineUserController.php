<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class OnlineUserController extends Controller
{
    /**
     * Get online user IDs (users with last_seen_at within last 3 minutes).
     */
    public function index(): JsonResponse
    {
        $onlineUserIds = Cache::remember('online_user_ids', 60, function () {
            return User::where('last_seen_at', '>=', now()->subMinutes(3))
                ->pluck('id')
                ->toArray();
        });

        return response()->json($onlineUserIds);
    }
}
