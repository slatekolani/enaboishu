<?php

namespace App\Support;

use HTMLPurifier;
use HTMLPurifier_Config;

/** Cleans HTML from the admin text editor so only safe formatting is stored. */
class RichText
{
    private static ?HTMLPurifier $purifier = null;

    public static function clean(?string $html): ?string
    {
        if ($html === null || trim(strip_tags($html)) === '') {
            return null;
        }

        return trim(self::purifier()->purify($html));
    }

    private static function purifier(): HTMLPurifier
    {
        if (! self::$purifier) {
            $cache = storage_path('app/purifier');
            if (! is_dir($cache)) {
                mkdir($cache, 0755, true);
            }

            $config = HTMLPurifier_Config::createDefault();
            $config->set('Cache.SerializerPath', $cache);
            $config->set('HTML.Allowed', 'p,br,strong,b,em,i,u,s,h2,h3,h4,ul,ol,li,blockquote,hr,a[href|target|rel]');
            $config->set('URI.AllowedSchemes', ['http' => true, 'https' => true, 'mailto' => true, 'tel' => true]);
            $config->set('HTML.TargetBlank', true);
            $config->set('AutoFormat.RemoveEmpty', true);
            self::$purifier = new HTMLPurifier($config);
        }

        return self::$purifier;
    }
}
