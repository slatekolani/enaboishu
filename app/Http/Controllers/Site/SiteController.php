<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\{Alumnus, Article, Club, CoreValue, Enquiry, Page, StudentLeader, Download, Event, Facility, GalleryItem, Message, Post, Program, Result, Slide, StaffMember, Stat, Testimonial};
use App\Support\Meta;
use App\Jobs\SendSubmissionNotifications;
use App\Support\Site;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SiteController extends Controller
{
    private const CARD = ['id', 'title', 'slug', 'excerpt', 'image', 'published_at', 'translations'];

    private function t(string $key): ?string
    {
        return Site::all(app()->getLocale())[$key] ?? null;
    }

    /**
     * Render a page with its search-engine and link-preview tags. Built-in pages pass $seo (their key in
     * Admin → Pages) so the search title and description set in the CMS replace the page's own wording.
     */
    private function page(string $component, array $props, ?string $title = null, ?string $description = null, ?string $image = null, string $type = 'website', ?string $seo = null, array $extra = [])
    {
        if ($seo) {
            $key = str_replace('-', '_', $seo);
            if ($seo !== 'home' && $title) {
                $extra['schema'][] = Meta::breadcrumbs([[$this->t('nav_home') ?? 'Home', url('/')], [$title, url()->current()]]);
            }
            $title = $this->t("seo_title_{$key}") ?: $title;
            $description = $this->t("seo_desc_{$key}") ?: $description;
        }
        $meta = Meta::make($title, $description, $image, $type, $extra);

        return Inertia::render($component, $props + ['seo' => ['title' => $meta['title'], 'description' => $meta['description']]])->withViewData('meta', $meta);
    }

    /** Search-engine details for a story, article, event or page the school wrote itself. */
    private function item(array $local, string $section, string $sectionUrl, array $schema = []): array
    {
        return [
            'schema' => array_filter([
                $schema ?: null,
                Meta::breadcrumbs([[$this->t('nav_home') ?? 'Home', url('/')], [$section, $sectionUrl], [$local['title'], url()->current()]]),
            ]),
            'published' => $schema['datePublished'] ?? null,
            'modified' => $schema['dateModified'] ?? null,
        ];
    }

    private function active(string $model, string $order = 'sort')
    {
        return $model::where('active', true)->orderBy($order)->orderBy('id');
    }

    private function posts()
    {
        return Post::where('active', true)->whereDate('published_at', '<=', now())->latest('published_at')->latest('id');
    }

    private function articles()
    {
        return Article::where('active', true)->whereDate('published_at', '<=', now())->latest('published_at')->latest('id');
    }

    private function upcomingEvents()
    {
        // An event stays "upcoming" until its last day has passed.
        return Event::where('active', true)
            ->where(fn ($q) => $q->whereDate('starts_at', '>=', now())->orWhereDate('ends_at', '>=', now()))
            ->orderBy('starts_at');
    }

    public function home()
    {
        $slides = $this->active(Slide::class)->get();

        return $this->page('Site/Home', [
            'slides' => $slides,
            'stats' => $this->active(Stat::class)->get(),
            'programs' => $this->active(Program::class)->get(),
            'posts' => $this->posts()->take(5)->get(self::CARD),
            'events' => $this->upcomingEvents()->take(4)->get(['id', 'title', 'slug', 'starts_at', 'ends_at', 'time', 'location', 'summary', 'translations']),
            'articles' => $this->articles()->take(3)->get([...self::CARD, 'author', 'category', 'body']),
            'testimonials' => $this->active(Testimonial::class)->get(),
        ], null, null, null, seo: 'home', extra: ['logo_preview' => true]);
    }

    public function about()
    {
        return $this->page('Site/About', [
            'values' => $this->active(CoreValue::class)->get(),
            'leaders' => $this->active(StaffMember::class)->where('department', 'Leadership')->get(),
        ], $this->t('about_title'), $this->t('about_intro'), $this->t('about_image'), seo: 'about');
    }

    public function academics()
    {
        return $this->page('Site/Academics', [
            'programs' => $this->active(Program::class)->get(),
            'facilities' => $this->active(Facility::class)->get(),
        ], $this->t('academics_title'), $this->t('academics_intro'), seo: 'academics');
    }

    public function admissions()
    {
        return $this->page('Site/Admissions', [
            'downloads' => $this->active(Download::class)
                ->whereIn('category', ['Joining instructions', 'Application form', 'Fee schedule'])
                ->take(6)->get(),
        ], $this->t('admissions_title'), $this->t('adm_intro'), seo: 'admissions');
    }

    public function downloads()
    {
        return $this->page('Site/Downloads', [
            'downloads' => $this->active(Download::class)->get(),
        ], $this->t('downloads_title'), $this->t('downloads_intro'), seo: 'downloads');
    }

    /** Count the download, then hand over the file. */
    public function download(Download $download)
    {
        abort_unless($download->active && Storage::disk('uploads')->exists($download->file), 404);
        $download->increment('downloads_count');

        return redirect()->to(asset('uploads/'.$download->file));
    }

    public function results()
    {
        return $this->page('Site/Results', [
            'results' => Result::where('active', true)->orderByDesc('year')->orderBy('exam')->get(),
        ], $this->t('results_title'), $this->t('results_intro'), seo: 'results');
    }

    public function staff()
    {
        return $this->page('Site/Staff', [
            'staff' => $this->active(StaffMember::class)->get(),
        ], $this->t('staff_title'), $this->t('staff_intro'), seo: 'staff');
    }

    public function news()
    {
        return $this->page('Site/News', [
            'posts' => $this->posts()->paginate(9, self::CARD),
        ], $this->t('news_page_title'), $this->t('news_intro'), seo: 'news');
    }

    public function post(string $slug)
    {
        $post = $this->posts()->where('slug', $slug)->firstOrFail();
        $local = $post->toArray();

        return $this->page('Site/Post', [
            'post' => $post,
            'related' => $this->posts()->where('id', '!=', $post->id)->take(3)->get(self::CARD),
        ], $local['seo_title'] ?: $local['title'], $local['seo_description'] ?: ($local['excerpt'] ?: $local['body']), $post->image, 'article', extra: $this->item($local, $this->t('nav_news') ?? 'News', route('news'),
            Meta::article('NewsArticle', $local['title'], $local['excerpt'] ?: $local['body'], $post->image, $post->published_at ? \Illuminate\Support\Carbon::parse($post->published_at)->toDateString() : null, $post->updated_at?->toIso8601String())));
    }

    public function articlesIndex()
    {
        return $this->page('Site/Articles', [
            'articles' => $this->articles()->paginate(9, [...self::CARD, 'author', 'category', 'body']),
        ], $this->t('articles_page_title'), $this->t('articles_intro'), seo: 'articles');
    }

    public function article(string $slug)
    {
        $article = $this->articles()->where('slug', $slug)->firstOrFail();
        $local = $article->toArray();

        return $this->page('Site/Article', [
            'article' => $article,
            'related' => $this->articles()->where('id', '!=', $article->id)->take(3)->get([...self::CARD, 'author', 'category', 'body']),
        ], $local['seo_title'] ?: $local['title'], $local['seo_description'] ?: ($local['excerpt'] ?: $local['body']), $article->image, 'article', extra: $this->item($local, $this->t('nav_articles') ?? 'Articles', route('articles'),
            Meta::article('Article', $local['title'], $local['excerpt'] ?: $local['body'], $article->image, $article->published_at ? \Illuminate\Support\Carbon::parse($article->published_at)->toDateString() : null, $article->updated_at?->toIso8601String(), $article->author)));
    }

    public function events()
    {
        return $this->page('Site/Events', [
            'upcoming' => $this->upcomingEvents()->get(),
            'past' => Event::where('active', true)
                ->whereDate('starts_at', '<', now())
                ->where(fn ($q) => $q->whereNull('ends_at')->orWhereDate('ends_at', '<', now()))
                ->orderByDesc('starts_at')->take(8)->get(),
        ], $this->t('events_page_title'), $this->t('events_intro'), seo: 'events');
    }

    public function event(string $slug)
    {
        $event = Event::where('active', true)->where('slug', $slug)->firstOrFail();
        $local = $event->toArray();

        return $this->page('Site/Event', [
            'event' => $event,
            'upcoming' => $this->upcomingEvents()->where('id', '!=', $event->id)->take(3)->get(['id', 'title', 'slug', 'starts_at', 'ends_at', 'time', 'location', 'translations']),
        ], $local['seo_title'] ?: $local['title'], $local['seo_description'] ?: ($local['summary'] ?: $local['description']), $event->image, 'website', extra: $this->item($local, $this->t('nav_events') ?? 'Events', route('events'),
            Meta::event($local['title'], $local['summary'] ?: $local['description'], $event->image, \Illuminate\Support\Carbon::parse($event->starts_at)->toDateString(), $event->ends_at ? \Illuminate\Support\Carbon::parse($event->ends_at)->toDateString() : null, $local['location'] ?? null)));
    }

    public function gallery()
    {
        return $this->page('Site/Gallery', [
            'items' => $this->active(GalleryItem::class)->get(),
        ], $this->t('gallery_title'), $this->t('gallery_intro'), GalleryItem::where('active', true)->orderBy('sort')->value('image'), seo: 'gallery');
    }

    public function customPage(string $slug)
    {
        $page = Page::where('active', true)->where('slug', $slug)->firstOrFail();
        $local = $page->toArray();

        return $this->page('Site/CustomPage', ['page' => $page], $local['seo_title'] ?: $local['title'], $local['seo_description'] ?: ($local['intro'] ?: $local['body']), $page->image,
            extra: ['schema' => [Meta::breadcrumbs([[$this->t('nav_home') ?? 'Home', url('/')], [$local['title'], url()->current()]])], 'modified' => $page->updated_at?->toIso8601String()]);
    }

    public function contact()
    {
        return $this->page('Site/Contact', [], $this->t('contact_title'), $this->t('contact_intro'), seo: 'contact');
    }

    public function sendMessage(Request $request)
    {
        // Hidden field that real visitors never fill in; bots usually do.
        if ($request->filled('website')) {
            return back()->with('success', $this->t('form_success'));
        }

        $data = $request->validate([
            'name' => 'required|string|max:120',
            'email' => 'required|email|max:160',
            'phone' => ['nullable', 'string', 'max:40', 'regex:/^[0-9+()\s-]{9,}$/'],
            'subject' => 'nullable|string|max:160',
            'body' => 'required|string|max:5000',
        ], ['phone.regex' => $this->t('phone_invalid')]);

        $message = Message::create($data);

        SendSubmissionNotifications::fire('message', [
            'name' => $message->name,
            'email' => $message->email,
            'phone' => $message->phone,
            'subject' => $message->subject ?: \Illuminate\Support\Str::limit($message->body, 60),
            'staff_heading' => 'New message from the website',
            'staff_details' => [
                'From' => $message->name,
                'Email' => $message->email,
                'Phone' => $message->phone,
                'Subject' => $message->subject,
                'Message' => $message->body,
            ],
            'admin_url' => route('admin.messages'),
        ]);

        return back()->with('success', $this->t('form_success'));
    }

    public function studentLife()
    {
        return $this->page('Site/StudentLife', [
            'clubs' => $this->active(Club::class)->get(),
            'leaders' => $this->active(StudentLeader::class)->get(),
        ], $this->t('life_title'), $this->t('life_intro'), Club::where('active', true)->whereNotNull('image')->orderBy('sort')->value('image'), seo: 'student-life');
    }

    public function alumni()
    {
        // Featured stories of people the school approved AND who agreed to be listed. Contact details never leave the admin.
        return $this->page('Site/Alumni', [
            'featured' => Alumnus::where('approved', true)->where('show_publicly', true)->where('featured', true)->orderBy('sort')->get(['id', 'name', 'graduation_year', 'occupation', 'organisation', 'story', 'photo', 'translations']),
        ], $this->t('alumni_title'), $this->t('alumni_intro'), seo: 'alumni');
    }

    public function apply()
    {
        return $this->page('Site/Apply', [
            'reference' => session('enquiry_reference'),
        ], $this->t('apply_title'), $this->t('apply_intro'), seo: 'apply');
    }

    public function submitApplication(Request $request)
    {
        if ($request->filled('website')) {
            return redirect()->route('apply');
        }

        $data = $request->validate([
            'student_name' => 'required|string|max:120',
            'gender' => 'nullable|in:Female,Male',
            'date_of_birth' => 'nullable|date|before:today|after:1990-01-01',
            'current_school' => 'nullable|string|max:160',
            'class_applying' => 'required|in:Form I,Form II,Form III,Form IV,Form V,Form VI',
            'guardian_name' => 'required|string|max:120',
            'relationship' => 'nullable|string|max:60',
            'phone' => ['required', 'string', 'max:40', 'regex:/^[0-9+()\s-]{9,}$/'],
            'email' => 'nullable|email|max:160',
            'address' => 'nullable|string|max:200',
            'heard_from' => 'nullable|string|max:120',
            'message' => 'nullable|string|max:3000',
            'consent' => 'accepted',
        ], ['phone.regex' => $this->t('phone_invalid')]);
        unset($data['consent']);

        $enquiry = Enquiry::create($data + ['reference' => Enquiry::nextReference(), 'status' => 'New', 'status_changed_at' => now()]);

        SendSubmissionNotifications::fire('enquiry', [
            'reference' => $enquiry->reference,
            'name' => $enquiry->guardian_name,
            'email' => $enquiry->email,
            'phone' => $enquiry->phone,
            'student' => $enquiry->student_name,
            'class' => $enquiry->class_applying,
            'staff_heading' => 'New admission enquiry '.$enquiry->reference,
            'staff_details' => [
                'Reference' => $enquiry->reference,
                'Student' => $enquiry->student_name,
                'Class applying for' => $enquiry->class_applying,
                'Current school' => $enquiry->current_school,
                'Parent / guardian' => trim($enquiry->guardian_name.' '.($enquiry->relationship ? "({$enquiry->relationship})" : '')),
                'Phone' => $enquiry->phone,
                'Email' => $enquiry->email,
                'Home area' => $enquiry->address,
                'Message' => $enquiry->message,
            ],
            'admin_url' => route('admin.enquiries', ['open' => $enquiry->id]),
        ]);

        return redirect()->route('apply')->with('enquiry_reference', $enquiry->reference);
    }

    public function language(Request $request, string $locale)
    {
        abort_unless(in_array($locale, Site::LOCALES, true), 404);
        $request->session()->put('locale', $locale);

        return back(fallback: route('home'));
    }
}
