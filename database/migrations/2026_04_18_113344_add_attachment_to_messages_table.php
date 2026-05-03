<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->text('content')->nullable()->change();
            $table->string('attachment_path')->nullable()->after('type');
            $table->string('attachment_name')->nullable()->after('attachment_path');
            $table->unsignedBigInteger('attachment_size')->nullable()->after('attachment_name');
            $table->string('attachment_mime')->nullable()->after('attachment_size');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->text('content')->nullable(false)->change();
            $table->dropColumn(['attachment_path', 'attachment_name', 'attachment_size', 'attachment_mime']);
        });
    }
};
