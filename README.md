# Laravel Reverb Chat

A production-style real-time private chat application built with Laravel, Reverb WebSockets, Inertia, React, TypeScript, and Tailwind CSS.

![PHP](https://img.shields.io/badge/PHP-8.3+-blue?logo=php)
![Laravel](https://img.shields.io/badge/Laravel-12-red?logo=laravel)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![Tests](https://img.shields.io/badge/Tests-90%20passing-brightgreen)

## Overview

Laravel Reverb Chat is a full-stack messaging app designed to demonstrate real application architecture, not just a UI prototype. It includes authenticated private conversations, real-time updates, message status, file sharing, notifications, search, and a tested Laravel API behind an Inertia/React frontend.

## Highlights

- Real-time private messaging with Laravel Reverb and Laravel Echo
- Typing indicators using private channel whispers
- Delivered and read receipts with broadcast updates
- File and image attachments with validation and public storage links
- Emoji reactions with grouped reaction counts
- Message editing, deletion, forwarding, and full-text search
- Database and broadcast notifications for new messages
- Online presence through heartbeat tracking
- Avatar upload and profile management
- Responsive chat interface with dark mode support
- Feature, unit, and browser tests with Pest 4
- GitHub Actions for tests, asset builds, type checks, and linting

## Tech Stack

| Layer         | Technology                               |
| ------------- | ---------------------------------------- |
| Backend       | PHP 8.3, Laravel 12                      |
| Realtime      | Laravel Reverb, Laravel Echo             |
| Frontend      | React 19, Inertia.js, TypeScript         |
| Styling       | Tailwind CSS 4, Radix/Base UI primitives |
| State         | Zustand                                  |
| Auth          | Laravel authentication, Sanctum          |
| Storage       | Laravel public filesystem disk           |
| Queue / Cache | Redis                                    |
| Testing       | Pest 4, Pest Browser                     |
| Tooling       | Vite, ESLint, Prettier, Laravel Pint     |

## Quality Gates

These commands currently pass:

```bash
php artisan test
npm run types
npm run build
```

Current test result:

```text
90 passed, 266 assertions
```

## Requirements

- PHP 8.3+
- Composer
- Node.js 22+
- MySQL 8+
- Redis

Laravel Sail is included if you prefer Docker.

## Local Setup

Install dependencies:

```bash
composer install
npm install
```

Create the environment file and app key:

```bash
cp .env.example .env
php artisan key:generate
```

Run migrations, seed demo data, and link storage:

```bash
php artisan migrate --seed
php artisan storage:link
```

Start the app, queue worker, Reverb server, and Vite:

```bash
composer run dev
```

Open the app at:

```text
http://localhost:8000
```

Demo users are seeded with the password:

```text
0123456789
```

Example seeded account:

```text
john@wick.com
```

## Docker Setup

Start the Sail containers:

```bash
./vendor/bin/sail up -d
```

Install dependencies and prepare the app:

```bash
./vendor/bin/sail composer install
./vendor/bin/sail npm install
./vendor/bin/sail artisan key:generate
./vendor/bin/sail artisan migrate --seed
./vendor/bin/sail artisan storage:link
```

Build frontend assets:

```bash
./vendor/bin/sail npm run build
```

Start Reverb and the queue worker:

```bash
./vendor/bin/sail artisan reverb:start
./vendor/bin/sail artisan queue:work
```

## Environment Notes

Important environment variables are already included in `.env.example`:

| Variable               | Purpose                                        |
| ---------------------- | ---------------------------------------------- |
| `BROADCAST_CONNECTION` | Uses `reverb` for WebSocket broadcasting       |
| `QUEUE_CONNECTION`     | Uses `redis` for queued notifications and jobs |
| `FILESYSTEM_DISK`      | Uses `public` for avatars and attachments      |
| `REVERB_APP_ID`        | Reverb application ID                          |
| `REVERB_APP_KEY`       | Reverb application key                         |
| `REVERB_APP_SECRET`    | Reverb application secret                      |
| `VITE_REVERB_*`        | Frontend Reverb connection settings            |

## Testing

Run the full PHP and browser test suite:

```bash
php artisan test
```

Run a focused test file:

```bash
php artisan test tests/Feature/MessageReactionTest.php
```

Check TypeScript:

```bash
npm run types
```

Build production assets:

```bash
npm run build
```

Format and lint:

```bash
vendor/bin/pint --dirty
npm run format
npm run lint
```

## Project Structure

```text
app/
├── Events/          Broadcast events for messages, receipts, reactions, and notifications
├── Http/
│   ├── Controllers/ API controllers
│   ├── Requests/    Form request validation
│   └── Resources/   API resources for frontend payloads
├── Models/          User, Message, MessageReaction, Notification
├── Notifications/   Database and broadcast notifications
└── Policies/        Message authorization rules

resources/js/
├── components/      Shared UI and chat components
├── contexts/        Notification and realtime context providers
├── hooks/           Browser, API, and chat behavior hooks
├── pages/           Inertia pages
├── services/        Frontend API service layer
├── stores/          Zustand stores
└── types/           Shared TypeScript types

tests/
├── Browser/         Pest browser smoke and chat tests
├── Feature/         API, auth, message, notification, and upload tests
└── Unit/            Focused unit tests
```

## Resume Summary

Built a real-time private chat application using Laravel 12, Reverb WebSockets, Inertia, React 19, TypeScript, Tailwind CSS, and Pest, supporting message delivery/read receipts, typing indicators, attachments, emoji reactions, notifications, search, and browser-tested user flows.

## License

MIT
