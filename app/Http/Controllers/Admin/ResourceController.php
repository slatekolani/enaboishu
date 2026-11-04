<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SlugRedirect;
use App\Support\Audit;
use App\Support\RichText;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ResourceController extends Controller
{
    use UploadsTrait;

    private function resource(string $key): array
    {
        $config = config("cms.resources.$key");
        abort_unless($config, 404);
        // Editors may only manage the content types marked 'editor' => true.
        abort_unless(empty($config['admin_only']) && (! empty($config['editor']) || auth()->user()?->hasRole('admin')), 403);

        return ['key' => $key] + $config;
    }

    private function meta(array $r): array
    {
        return [
            'key' => $r['key'],
            'label' => $r['label'],
            'singular' => $r['singular'],
            'description' => $r['description'] ?? null,
            'columns' => $r['columns'],
            'slug_from' => $r['slug_from'] ?? null,
            'fields' => collect($r['fields'])->map(function ($f) use ($r) {
                if (($f['default'] ?? null) === 'today') {
                    $f['default'] = now()->toDateString();
                }
                // The address in front of the editable part, e.g. https://…/news/
                if ($f['type'] === 'slug' && isset($r['public_route'])) {
                    $f['prefix'] = Str::before(route($r['public_route'], ['slug' => '__slug__']), '__slug__');
                }

                return $f;
            })->all(),
        ];
    }

    public function index(string $resource)
    {
        $r = $this->resource($resource);
        $query = $r['model']::query()->orderBy(...$r['order']);
        if (($r['order'][0] ?? null) !== 'id') {
            $query->orderBy('id', 'desc');
        }

        return Inertia::render('Admin/Index', [
            'resource' => $this->meta($r),
            'rows' => $query->get(),
        ]);
    }

    public function create(string $resource)
    {
        return Inertia::render('Admin/Form', [
            'resource' => $this->meta($this->resource($resource)),
            'record' => null,
        ]);
    }

    public function store(Request $request, string $resource)
    {
        $r = $this->resource($resource);
        $data = $this->payload($request, $r, null);

        $record = $r['model']::create($data);
        Audit::log("Added {$r['singular']} “".Audit::name($record).'”', $record, ['resource' => $r['label']], 'created');

        return $this->toIndex($r)
            ->with('success', ucfirst($r['singular']).' added.');
    }

    public function edit(string $resource, int $id)
    {
        $r = $this->resource($resource);

        return Inertia::render('Admin/Form', [
            'resource' => $this->meta($r),
            'record' => $r['model']::findOrFail($id),
        ]);
    }

    public function update(Request $request, string $resource, int $id)
    {
        $r = $this->resource($resource);
        $record = $r['model']::findOrFail($id);
        // Compare yes/no fields as true/false so unchanged switches are not logged as edits.
        $record->mergeCasts(collect($r['fields'])->where('type', 'boolean')->mapWithKeys(fn ($f) => [$f['name'] => 'boolean'])->all());
        $oldSlug = $record->slug ?? null;
        $record->update($this->payload($request, $r, $record));
        $this->rememberOldAddress($r, $record, $oldSlug);
        $changed = array_values(array_diff(array_keys($record->getChanges()), ['updated_at']));
        if ($changed) {
            $labels = collect($r['fields'])->keyBy('name');
            Audit::log("Edited {$r['singular']} “".Audit::name($record).'”', $record, [
                'resource' => $r['label'],
                'fields' => array_map(fn ($f) => $f === 'translations' ? 'Kiswahili text' : ($labels[$f]['label'] ?? $f), $changed),
            ]);
        }

        return $this->toIndex($r)
            ->with('success', ucfirst($r['singular']).' saved.');
    }

    public function destroy(string $resource, int $id)
    {
        $r = $this->resource($resource);
        $record = $r['model']::findOrFail($id);

        foreach ($r['fields'] as $field) {
            $value = $record->{$field['name']};
            match ($field['type']) {
                'image', 'file' => $this->deleteFiles([$value]),
                'gallery' => $this->deleteFiles($value ?? []),
                default => null,
            };
        }
        Audit::log("Deleted {$r['singular']} “".Audit::name($record).'”', null, ['resource' => $r['label']], 'deleted');
        $record->delete();

        return $this->toIndex($r)
            ->with('success', ucfirst($r['singular']).' deleted.');
    }

    /** Where to go after saving: the resource list, or a custom screen such as Admin → Pages. */
    private function toIndex(array $r)
    {
        return isset($r['index_route']) ? redirect()->route($r['index_route']) : redirect()->route('admin.resource.index', $r['key']);
    }

    private function payload(Request $request, array $r, $record): array
    {
        $rules = [];
        foreach ($r['fields'] as $field) {
            $rules += $this->rulesFor($field);
            if (in_array($field['type'], ['image', 'file']) && ($field['required'] ?? false) && ! $record) {
                $rules[$field['name']] = str_replace('nullable', 'required', $rules[$field['name']]);
            }
        }
        foreach ($r['fields'] as $field) {
            if ($field['translate'] ?? false) {
                $rules["translations.sw.{$field['name']}"] = 'nullable|string|max:'.($field['type'] === 'richtext' ? 200000 : 2000);
            }
        }
        $request->validate($rules, [
            '*_new.*.image' => 'Each gallery file must be a photo (JPG, PNG, WebP or GIF).',
            '*_new.*.max' => 'Each gallery photo must be 8 MB or smaller.',
        ]);

        $data = [];
        foreach ($r['fields'] as $field) {
            $name = $field['name'];
            $data[$name] = match ($field['type']) {
                'image', 'file' => $this->handleFile($request, $field, $record?->{$name}),
                'gallery' => $this->handleGallery($request, $field, $record?->{$name}),
                'richtext' => RichText::clean($request->input($name)),
                'boolean' => $request->boolean($name),
                'number' => (int) $request->input($name, 0),
                default => $request->filled($name) ? $request->input($name) : null,
            };
        }

        // Kiswahili versions of the fields marked 'translate'.
        $translated = collect($r['fields'])->filter(fn ($f) => $f['translate'] ?? false);
        if ($translated->isNotEmpty()) {
            $sw = [];
            foreach ($translated as $field) {
                $value = $request->input("translations.sw.{$field['name']}");
                $value = $field['type'] === 'richtext' ? RichText::clean($value) : (is_string($value) ? trim($value) : null);
                if ($value !== null && $value !== '') {
                    $sw[$field['name']] = $value;
                }
            }
            $data['translations'] = $sw ? ['sw' => $sw] : null;
        }

        // Downloads remember their size and type, shown to visitors as "PDF · 1.2 MB".
        if (! empty($r['file_meta'])) {
            if ($request->hasFile('file')) {
                $data['file_size'] = $request->file('file')->getSize();
            } elseif (! $record || $record->file !== ($data['file'] ?? null)) {
                $data['file_size'] = null;
            }
            $data['file_type'] = ! empty($data['file']) ? strtoupper(pathinfo($data['file'], PATHINFO_EXTENSION)) : null;
        }

        // The web address: what the editor typed (tidied up), or made from the title when left empty.
        if (isset($r['slug_from'])) {
            $wanted = Str::slug((string) ($data['slug'] ?? ''));
            if ($record && ! $request->has('slug')) {
                $data['slug'] = $record->slug; // not sent at all: keep the current address
            } elseif ($wanted === '') {
                $data['slug'] = $this->uniqueSlug($r['model'], (string) $data[$r['slug_from']], $record?->id);
            } elseif ($r['model']::where('slug', $wanted)->when($record, fn ($q) => $q->whereKeyNot($record->id))->exists()) {
                throw ValidationException::withMessages(['slug' => 'Another '.$r['singular'].' already uses this web address. Please choose a different one.']);
            } else {
                $data['slug'] = $wanted;
            }
        }

        return $data;
    }

    /** When an address changes, the old one keeps working: it redirects to the new address. */
    private function rememberOldAddress(array $r, $record, ?string $oldSlug): void
    {
        if (! isset($r['slug_from']) || ! $oldSlug || $oldSlug === $record->slug) {
            return;
        }
        SlugRedirect::updateOrCreate(['resource' => $r['key'], 'old_slug' => $oldSlug], ['record_id' => $record->id]);
        // The new address is a real page again, so it must not redirect anywhere.
        SlugRedirect::where('resource', $r['key'])->where('old_slug', $record->slug)->delete();
    }

    private function uniqueSlug(string $model, string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title) ?: 'post';
        $slug = $base;
        $i = 2;
        while ($model::where('slug', $slug)->when($ignoreId, fn ($q) => $q->whereKeyNot($ignoreId))->exists()) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }
}
