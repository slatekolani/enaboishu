<?php

namespace App\Support;

/**
 * Favicons, the iPhone home-screen icon and the Android app icons, all made from one picture:
 * the "Browser-tab icon" uploaded in Site settings → Search engines, or the school crest.
 *
 * The crest's set lives in public/ (favicon.ico, icon-*.png); an uploaded icon's set is made
 * the first time it is needed, in public/uploads/icons/<fingerprint>/, so a new upload simply
 * gets a new folder and browsers never keep showing the old icon.
 */
class SiteIcons
{
    public const SIZES = ['favicon-16x16.png' => 16, 'favicon-32x32.png' => 32, 'apple-touch-icon.png' => 180, 'icon-192.png' => 192, 'icon-512.png' => 512];

    /** Background behind the larger icons (iPhones show transparent areas as black). */
    private const PAPER = [249, 247, 242];

    /** Public URLs of every icon, keyed by file name. */
    public static function urls(): array
    {
        $upload = Site::all('en')['site_icon'] ?? null;
        $source = $upload ? public_path('uploads/'.$upload) : null;

        if ($source && is_file($source)) {
            $dir = 'uploads/icons/'.substr(md5($upload.filemtime($source)), 0, 12);
            if (! is_file(public_path("$dir/favicon.ico"))) {
                self::generate($source, public_path($dir));
            }
        } else {
            $dir = '';
            if (! is_file(public_path('icon-512.png'))) {
                self::generate(public_path('images/crest.png'), public_path());
            }
        }

        $base = $dir === '' ? '' : "$dir/";
        $names = ['favicon.ico', ...array_keys(self::SIZES)];

        return array_combine($names, array_map(fn ($n) => asset($base.$n), $names));
    }

    /** Write favicon.ico (16, 32 and 48 px inside) and the PNG sizes into $dir. */
    public static function generate(string $source, string $dir): void
    {
        $img = @imagecreatefromstring((string) file_get_contents($source));
        if (! $img) {
            return;
        }
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        imagealphablending($img, true);

        foreach (self::SIZES as $name => $size) {
            // Small favicons keep a transparent background and fill the square;
            // the home-screen icons sit on paper with a margin, as phones expect.
            $large = $size >= 180;
            imagepng(self::square($img, $size, $large ? 0.12 : 0.02, $large), "$dir/$name", 9);
        }

        $frames = [];
        foreach ([16, 32, 48] as $size) {
            ob_start();
            imagepng(self::square($img, $size, 0.02, false), null, 9);
            $frames[$size] = ob_get_clean();
        }
        file_put_contents("$dir/favicon.ico", self::ico($frames));
    }

    /** The picture centred in a square of $size px, keeping its proportions. */
    private static function square(\GdImage $src, int $size, float $margin, bool $paper): \GdImage
    {
        $out = imagecreatetruecolor($size, $size);
        imagesavealpha($out, true);
        imagealphablending($out, false);
        imagefill($out, 0, 0, $paper ? imagecolorallocate($out, ...self::PAPER) : imagecolorallocatealpha($out, 0, 0, 0, 127));
        imagealphablending($out, true);

        $w = imagesx($src);
        $h = imagesy($src);
        $box = $size * (1 - 2 * $margin);
        $scale = min($box / $w, $box / $h);
        $dw = max(1, (int) round($w * $scale));
        $dh = max(1, (int) round($h * $scale));
        imagecopyresampled($out, $src, (int) (($size - $dw) / 2), (int) (($size - $dh) / 2), 0, 0, $dw, $dh, $w, $h);

        return $out;
    }

    /** An .ico file holding PNG images (understood by every current browser). */
    private static function ico(array $frames): string
    {
        $header = pack('vvv', 0, 1, count($frames));
        $offset = 6 + 16 * count($frames);
        $entries = '';
        $data = '';
        foreach ($frames as $size => $png) {
            $entries .= pack('CCCCvvVV', $size >= 256 ? 0 : $size, $size >= 256 ? 0 : $size, 0, 0, 1, 32, strlen($png), $offset);
            $offset += strlen($png);
            $data .= $png;
        }

        return $header.$entries.$data;
    }
}
