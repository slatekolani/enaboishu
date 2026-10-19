<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Enquiry extends Model
{
    public const STATUSES = ['New', 'Contacted', 'Visit booked', 'Admitted', 'Not admitted', 'Withdrawn'];

    protected $guarded = [];

    protected $casts = ['date_of_birth' => 'date', 'status_changed_at' => 'datetime'];

    /** A short reference parents can quote when they call, e.g. ENQ-2026-0007. */
    public static function nextReference(): string
    {
        $year = now()->year;
        $count = static::whereYear('created_at', $year)->count() + 1;

        do {
            $ref = sprintf('ENQ-%d-%04d', $year, $count++);
        } while (static::where('reference', $ref)->exists());

        return $ref;
    }
}
