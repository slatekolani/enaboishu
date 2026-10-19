<?php

namespace App\Models\Concerns;

/**
 * Records with a "translations" column ({"sw": {"title": "…"}}).
 * On the public site in Kiswahili, translated fields replace the English ones;
 * fields that have not been translated stay in English.
 */
trait Translatable
{
    /** Every content type has an "active" switch: treat it as true/false, not 1/0. */
    public function initializeTranslatable(): void
    {
        $this->mergeCasts(['active' => 'boolean']);
    }

    public function toArray()
    {
        $data = parent::toArray();

        if (app()->getLocale() !== 'en' && ! request()->is('admin*')) {
            foreach (($this->translations[app()->getLocale()] ?? []) as $field => $value) {
                if ($value !== null && $value !== '' && array_key_exists($field, $data)) {
                    $data[$field] = $value;
                }
            }
        }

        if (! request()->is('admin*')) {
            unset($data['translations']);
        }

        return $data;
    }
}
