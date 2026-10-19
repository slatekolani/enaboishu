<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Model;

/** Records who changed what in the admin panel (Admin → Change history). */
class Audit
{
    public static function log(string $description, ?Model $subject = null, array $properties = [], string $event = 'updated'): void
    {
        $entry = activity('admin')->event($event)->withProperties($properties);
        if (auth()->user()) {
            $entry->causedBy(auth()->user());
        }
        if ($subject) {
            $entry->performedOn($subject);
        }
        $entry->log($description);
    }

    /** A readable name for a record: its title, name, message or reference. */
    public static function name(Model $record): string
    {
        foreach (['title', 'name', 'student_name', 'message', 'label', 'caption', 'reference'] as $attr) {
            if (filled($record->{$attr} ?? null)) {
                return \Illuminate\Support\Str::limit(strip_tags((string) $record->{$attr}), 80);
            }
        }

        return '#'.$record->getKey();
    }
}
