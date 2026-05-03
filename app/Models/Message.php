<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Message extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'sender_id',
        'recipient_id',
        'content',
        'type',
        'attachment_path',
        'attachment_name',
        'attachment_size',
        'attachment_mime',
        'delivered_at',
        'read_at',
        'edited_at',
        'deleted_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'delivered_at' => 'datetime',
        'read_at' => 'datetime',
        'edited_at' => 'datetime',
        'deleted_at' => 'datetime',
        'attachment_size' => 'integer',
    ];

    /**
     * Get the sender of the message.
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Get the recipient of the message.
     */
    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }

    /**
     * Get the reactions for the message.
     */
    public function reactions(): HasMany
    {
        return $this->hasMany(MessageReaction::class);
    }

    /**
     * Get the public URL for the attachment.
     */
    public function getAttachmentUrlAttribute(): ?string
    {
        return $this->attachment_path ? Storage::url($this->attachment_path) : null;
    }

    /**
     * Scope a query to only include unread messages.
     */
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    /**
     * Scope a query to only include read messages.
     */
    public function scopeRead($query)
    {
        return $query->whereNotNull('read_at');
    }

    /**
     * Mark the message as read.
     */
    public function markAsRead()
    {
        $this->update(['read_at' => now()]);
    }

    /**
     * Mark the message as deleted for display purposes.
     */
    public function markAsDeleted()
    {
        $this->update(['deleted_at' => now()]);
    }

    /**
     * Check if the message is marked as deleted.
     */
    public function isDeleted(): bool
    {
        return ! is_null($this->deleted_at);
    }

    /**
     * Get the display content (show "Message deleted" if deleted, or attachment name for file messages).
     */
    public function getDisplayContentAttribute(): string
    {
        if ($this->isDeleted()) {
            return 'Message deleted';
        }

        return $this->content ?? $this->attachment_name ?? '';
    }

    /**
     * Scope a query to only include non-deleted messages.
     */
    public function scopeNotDeleted($query)
    {
        return $query->whereNull('deleted_at');
    }

    /**
     * Scope a query to only include deleted messages.
     */
    public function scopeDeleted($query)
    {
        return $query->whereNotNull('deleted_at');
    }
}
