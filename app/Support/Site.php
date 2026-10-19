<?php

namespace App\Support;

use App\Models\Setting;
use Illuminate\Support\Facades\Schema;

class Site
{
    public const LOCALES = ['en', 'sw'];

    /** Field types that hold words (and so can have a Kiswahili version). */
    private const TEXT_TYPES = ['text', 'textarea', 'longtext', 'richtext'];

    private static array $cache = [];

    private static ?array $stored = null;

    /** Every setting field, keyed by name. */
    public static function fields(): array
    {
        $fields = [];
        foreach (config('cms.settings') as $group) {
            foreach ($group as $field) {
                $fields[$field['name']] = $field;
            }
        }

        return $fields;
    }

    public static function translatable(array $field): bool
    {
        return in_array($field['type'], self::TEXT_TYPES, true) && ($field['translate'] ?? true);
    }

    /**
     * All editable settings in the given language.
     * Kiswahili falls back to: the Kiswahili entered in the admin → the built-in Kiswahili label → English.
     */
    public static function all(?string $locale = null): array
    {
        $locale = in_array($locale, self::LOCALES, true) ? $locale : 'en';
        if (isset(self::$cache[$locale])) {
            return self::$cache[$locale];
        }

        $stored = self::stored();
        $swDefaults = config('cms_sw', []);
        $values = [];

        foreach (self::fields() as $name => $field) {
            $default = $field['default'] ?? null;
            $value = array_key_exists($name, $stored) ? $stored[$name] : $default;
            if (($value === null || $value === '') && ($field['fallback'] ?? false)) {
                $value = $default;
            }

            if ($locale === 'sw' && self::translatable($field)) {
                $sw = $stored["{$name}__sw"] ?? null;
                if ($sw !== null && $sw !== '') {
                    $value = $sw;
                } elseif (isset($swDefaults[$name]) && $value === $default) {
                    // The built-in Kiswahili only applies while the English is still the original text;
                    // once the school rewrites the English, it is shown until they add their own Kiswahili.
                    $value = $swDefaults[$name];
                }
            }

            $values[$name] = $value;
        }

        return self::$cache[$locale] = $values;
    }

    /** Kiswahili values exactly as entered in the admin (no fallbacks), for the translation editor. */
    public static function swRaw(): array
    {
        $stored = self::stored();
        $out = [];
        foreach (self::fields() as $name => $field) {
            if (self::translatable($field)) {
                $out[$name] = $stored["{$name}__sw"] ?? '';
            }
        }

        return $out;
    }

    private static function stored(): array
    {
        if (self::$stored === null) {
            self::$stored = Schema::hasTable('settings') ? Setting::pluck('value', 'key')->all() : [];
        }

        return self::$stored;
    }

    public static function forget(): void
    {
        self::$cache = [];
        self::$stored = null;
    }
}
