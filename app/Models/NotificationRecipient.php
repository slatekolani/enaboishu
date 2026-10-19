<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** A person the school wants alerted about website submissions (head of school, secretary, …). */
class NotificationRecipient extends Model
{
    public const EVENTS = ['enquiry' => 'on_enquiries', 'message' => 'on_messages'];

    protected $guarded = [];

    protected $casts = [
        'active' => 'boolean',
        'on_enquiries' => 'boolean', 'on_messages' => 'boolean', 'on_alumni' => 'boolean',
    ];

    public function scopeFor($query, string $event)
    {
        return $query->where('active', true)->where(self::EVENTS[$event] ?? 'on_messages', true);
    }
}
