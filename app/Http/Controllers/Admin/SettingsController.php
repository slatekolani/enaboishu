<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Support\Audit;
use App\Support\RichText;
use App\Support\Site;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    use UploadsTrait;

    public function edit(Request $request)
    {
        $lang = $request->query('lang') === 'sw' ? 'sw' : 'en';

        return Inertia::render('Admin/Settings', [
            'lang' => $lang,
            'groups' => $lang === 'sw'
                // Only words can be translated: images, links and numbers are shared by both languages.
                ? collect(config('cms.settings'))->map(fn ($g) => array_values(array_filter($g, fn ($f) => Site::translatable($f))))->filter()->all()
                : config('cms.settings'),
            'values' => $lang === 'sw' ? Site::swRaw() : Site::all('en'),
            'english' => Site::all('en'),
            'swDefaults' => config('cms_sw'),
        ]);
    }

    public function update(Request $request)
    {
        $lang = $request->input('_lang') === 'sw' ? 'sw' : 'en';
        $fields = collect(Site::fields());
        if ($lang === 'sw') {
            $fields = $fields->filter(fn ($f) => Site::translatable($f));
        }

        $rules = [];
        foreach ($fields as $field) {
            $rules[$field['name']] = match ($field['type']) {
                'image' => 'nullable|'.self::IMAGE_RULE,
                'url' => 'nullable|url|max:1000',
                'richtext' => 'nullable|string|max:200000',
                default => 'nullable|string|max:20000',
            };
        }
        $request->validate($rules);

        $current = Site::all('en');
        $changed = [];
        foreach ($fields as $field) {
            $name = $field['name'];
            // Only change what was sent: a partial save never wipes other settings.
            if ($field['type'] === 'image' ? ! $request->hasFile($name) && ! $request->boolean("_remove_$name") : ! $request->exists($name)) {
                continue;
            }
            $value = match ($field['type']) {
                'image' => $this->handleFile($request, $field, $current[$name] ?? null),
                'richtext' => RichText::clean($request->input($name)),
                default => $request->filled($name) ? $request->input($name) : null,
            };

            $setting = Setting::firstOrNew(['key' => $lang === 'sw' ? "{$name}__sw" : $name]);
            $before = $setting->exists ? $setting->value : ($lang === 'sw' ? null : ($field['default'] ?? null));
            $setting->value = $value;
            $setting->save();
            if ((string) $before !== (string) $value) {
                $changed[] = $field['label'];
            }
        }
        Site::forget();

        if ($changed) {
            Audit::log($lang === 'sw' ? 'Edited Kiswahili site text' : 'Edited site settings', null, ['fields' => $changed]);
        }

        $what = $request->input('_context') === 'page' ? 'Page' : 'Site settings';

        return back()->with('success', $lang === 'sw' ? "Kiswahili text saved ({$what})." : "{$what} saved.");
    }
}
