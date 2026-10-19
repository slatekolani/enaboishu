<?php

namespace App\Http\Controllers\Admin;

use App\Support\ImageOptimizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * Shared upload handling. Files are written to public/uploads (the "uploads" disk),
 * so they are served directly by the web server.
 */
trait UploadsTrait
{
    protected const IMAGE_RULE = 'image|mimes:jpg,jpeg,png,webp,gif|max:8192';

    protected function disk()
    {
        return Storage::disk('uploads');
    }

    /** Validation rules for one field (a gallery adds a rule for each new photo). */
    protected function rulesFor(array $field): array
    {
        $name = $field['name'];

        return match ($field['type']) {
            'image' => [$name => 'nullable|'.self::IMAGE_RULE],
            'file' => [$name => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx|max:10240'],
            'gallery' => [
                "{$name}_keep" => 'nullable|array',
                "{$name}_keep.*" => 'string',
                "{$name}_new" => 'nullable|array|max:30',
                "{$name}_new.*" => self::IMAGE_RULE,
            ],
            'boolean' => [$name => 'boolean'],
            'richtext' => [$name => 'nullable|string|max:200000'],
            default => [$name => $field['rules'] ?? 'nullable|string'],
        };
    }

    /** Store an uploaded file (or keep / remove the current one) and return the value to save. */
    protected function handleFile(Request $request, array $field, ?string $current): ?string
    {
        $name = $field['name'];

        if ($request->hasFile($name)) {
            $this->deleteFiles([$current]);

            return $field['type'] === 'image'
                ? ImageOptimizer::store($request->file($name), 'images/'.date('Y/m'), $field['max_side'] ?? 2000, shareCopy: true)
                : $request->file($name)->store('documents/'.date('Y/m'), 'uploads');
        }

        if ($request->boolean("_remove_$name") && ! ($field['required'] ?? false)) {
            $this->deleteFiles([$current]);

            return null;
        }

        return $current;
    }

    /** Keep the photos the editor left in place, delete the rest, and add new uploads. */
    protected function handleGallery(Request $request, array $field, ?array $current): array
    {
        $name = $field['name'];
        $current = $current ?? [];
        // Only paths that already belong to this record can be kept.
        $keep = array_values(array_intersect((array) $request->input("{$name}_keep", []), $current));
        $this->deleteFiles(array_diff($current, $keep));

        foreach ((array) $request->file("{$name}_new", []) as $file) {
            $keep[] = ImageOptimizer::store($file, 'gallery/'.date('Y/m'), 1800);
        }

        return $keep;
    }

    protected function deleteFiles(array $paths): void
    {
        // Files in uploads/demo are a shared library used by several entries (and by any test
        // database): never delete them when one entry changes. Normal uploads have unique names.
        $paths = array_filter($paths, fn ($p) => $p && ! str_starts_with($p, 'demo/'));
        // Remove link-preview copies made alongside cover photos.
        $paths = array_merge($paths, array_map(fn ($p) => ImageOptimizer::sharePath($p), $paths));
        if ($paths) {
            $this->disk()->delete($paths);
        }
    }
}
