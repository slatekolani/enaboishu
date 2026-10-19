<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Shrinks uploaded photos before they are saved, so pages stay fast on mobile data.
 *
 * - Turns phone photos the right way up (EXIF orientation).
 * - Scales the longest side down to $maxSide pixels (never up).
 * - Saves as WebP when the server supports it, otherwise as progressive JPEG.
 *   Images with transparency (logos, crests) stay PNG. Animated GIFs are kept as they are.
 * - For WebP covers, also writes a JPEG copy ("…-share.jpg") for WhatsApp/Facebook link previews.
 */
class ImageOptimizer
{
    public const QUALITY = 82;

    public static function store(UploadedFile $file, string $directory, int $maxSide = 2000, bool $shareCopy = false): string
    {
        $disk = Storage::disk('uploads');
        $mime = $file->getMimeType();

        // Leave GIFs (possibly animated) and anything GD cannot read untouched.
        if ($mime === 'image/gif' || ! function_exists('imagecreatefromstring')) {
            return $file->store($directory, 'uploads');
        }

        $image = @imagecreatefromstring((string) file_get_contents($file->getRealPath()));
        if (! $image) {
            return $file->store($directory, 'uploads');
        }

        $image = self::orient($image, $file, $mime);
        $image = self::scale($image, $maxSide);
        $transparent = $mime === 'image/png' && self::hasTransparency($image);

        $webp = function_exists('imagewebp') && (imagetypes() & IMG_WEBP);
        $ext = $transparent ? 'png' : ($webp ? 'webp' : 'jpg');
        $path = trim($directory, '/').'/'.Str::random(40).'.'.$ext;

        ob_start();
        if ($transparent) {
            imagesavealpha($image, true);
            imagepng($image, null, 8);
        } elseif ($webp) {
            imagewebp($image, null, self::QUALITY);
        } else {
            imageinterlace($image, true); // progressive JPEG: shows quickly on slow connections
            imagejpeg(self::flatten($image), null, self::QUALITY);
        }
        $disk->put($path, ob_get_clean());

        if ($shareCopy && $ext === 'webp') {
            ob_start();
            imagejpeg(self::flatten(self::scale($image, 1200)), null, 80);
            $disk->put(self::sharePath($path), ob_get_clean());
        }

        imagedestroy($image);

        return $path;
    }

    /** The JPEG used for link previews: the share copy if one exists, otherwise the image itself. */
    public static function shareImage(?string $path): ?string
    {
        if (! $path) {
            return null;
        }
        $share = self::sharePath($path);

        return Storage::disk('uploads')->exists($share) ? $share : $path;
    }

    public static function sharePath(string $path): string
    {
        return preg_replace('/\.[a-z0-9]+$/i', '', $path).'-share.jpg';
    }

    private static function orient(\GdImage $image, UploadedFile $file, ?string $mime): \GdImage
    {
        if ($mime !== 'image/jpeg' || ! function_exists('exif_read_data')) {
            return $image;
        }
        $exif = @exif_read_data($file->getRealPath());
        $rotate = [3 => 180, 6 => -90, 8 => 90][$exif['Orientation'] ?? 1] ?? 0;

        return $rotate ? (imagerotate($image, $rotate, 0) ?: $image) : $image;
    }

    private static function scale(\GdImage $image, int $maxSide): \GdImage
    {
        $w = imagesx($image);
        $h = imagesy($image);
        $ratio = $maxSide / max($w, $h);
        if ($ratio >= 1) {
            return $image;
        }

        $scaled = imagecreatetruecolor((int) round($w * $ratio), (int) round($h * $ratio));
        imagealphablending($scaled, false);
        imagesavealpha($scaled, true);
        imagecopyresampled($scaled, $image, 0, 0, 0, 0, imagesx($scaled), imagesy($scaled), $w, $h);

        return $scaled;
    }

    /** JPEG has no transparency: paint any transparent areas white. */
    private static function flatten(\GdImage $image): \GdImage
    {
        $flat = imagecreatetruecolor(imagesx($image), imagesy($image));
        imagefill($flat, 0, 0, imagecolorallocate($flat, 255, 255, 255));
        imagecopy($flat, $image, 0, 0, 0, 0, imagesx($image), imagesy($image));

        return $flat;
    }

    private static function hasTransparency(\GdImage $image): bool
    {
        $w = imagesx($image);
        $h = imagesy($image);
        $step = max(1, (int) floor(min($w, $h) / 40));
        for ($x = 0; $x < $w; $x += $step) {
            for ($y = 0; $y < $h; $y += $step) {
                if (((imagecolorat($image, $x, $y) >> 24) & 0x7F) > 0) {
                    return true;
                }
            }
        }

        return false;
    }
}
