<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'John Wick',
                'email' => 'john@wick.com',
                'password' => Hash::make('0123456789'),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'John Doe',
                'email' => 'john@doe.com',
                'password' => Hash::make('0123456789'),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Sarah Johnson',
                'email' => 'sarah@johnson.com',
                'password' => Hash::make('0123456789'),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Mike Chen',
                'email' => 'mike@chen.com',
                'password' => Hash::make('0123456789'),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Emily Davis',
                'email' => 'emily@davis.com',
                'password' => Hash::make('0123456789'),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Alex Rodriguez',
                'email' => 'alex@rodriguez.com',
                'password' => Hash::make('0123456789'),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Lisa Thompson',
                'email' => 'lisa@thompson.com',
                'password' => Hash::make('0123456789'),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'David Kim',
                'email' => 'david@kim.com',
                'password' => Hash::make('0123456789'),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Anna Martinez',
                'email' => 'anna@martinez.com',
                'password' => Hash::make('0123456789'),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Tom Wilson',
                'email' => 'tom@wilson.com',
                'password' => Hash::make('0123456789'),
                'email_verified_at' => now(),
            ],
        ];

        foreach ($users as $user) {
            User::create($user);
        }
    }
}
