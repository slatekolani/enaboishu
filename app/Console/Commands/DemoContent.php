<?php

namespace App\Console\Commands;

use App\Models\{Alumnus, Article, Club, Download, Enquiry, Event, Facility, GalleryItem, Message, Notice, NotificationRecipient, Post, Result, Setting, Slide, StaffMember, Stat, StudentLeader, Testimonial};
use App\Support\Site;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

/**
 * Fills every part of the website with clearly-invented demo content and photos, so the layout
 * can be judged before the school's real content exists.
 *
 *   php artisan demo:seed    add the demo content (photos come from public/uploads/demo)
 *   php artisan demo:clear   remove every demo record and restore the settings that were changed
 *
 * Everything added or changed is recorded in storage/app/demo-content-<database>.json, so clearing is exact
 * and never touches the school's own content.
 */
class DemoContent extends Command
{
    protected $signature = 'demo:seed {--clear : Remove the demo content instead}';

    protected $description = 'Fill the website with demo content and photos (use demo:clear to remove it)';

    /** One record file per database, so a test database never blocks the real one. */
    private function stateFile(): string
    {
        $db = config('database.default');

        return 'demo-content-'.substr(md5($db.'|'.config("database.connections.{$db}.database")), 0, 10).'.json';
    }

    private array $state = ['created' => [], 'settings' => [], 'changed' => []];

    public function handle(): int
    {
        if ($this->option('clear')) {
            return $this->clear();
        }

        if (Storage::disk('local')->exists($this->stateFile())) {
            $this->warn('Demo content is already installed. Run "php artisan demo:clear" first.');

            return self::FAILURE;
        }
        if (! is_dir(public_path('uploads/demo'))) {
            $this->error('Demo photos are missing: public/uploads/demo');

            return self::FAILURE;
        }

        $this->settings();
        $this->home();
        $this->people();
        $this->updates();
        $this->studentLife();
        $this->academics();
        $this->inbox();

        Storage::disk('local')->put($this->stateFile(), json_encode($this->state, JSON_PRETTY_PRINT));
        Site::forget();

        $total = collect($this->state['created'])->flatten()->count();
        $this->info("Demo content added: {$total} items and ".count($this->state['settings']).' settings. Remove it any time with: php artisan demo:clear');

        return self::SUCCESS;
    }

    /* ------------------------------------------------------------------ */

    private function img(string $name): string
    {
        return "demo/{$name}.jpg";
    }

    private function make(string $model, array $attributes)
    {
        $record = $model::create($attributes);
        $this->state['created'][$model][] = $record->id;

        return $record;
    }

    /** Change a field on an existing record, remembering the old value for demo:clear. */
    private function change($record, array $attributes): void
    {
        $key = get_class($record).'#'.$record->id;
        $this->state['changed'][$key] ??= array_intersect_key($record->getAttributes(), $attributes);
        $record->update($attributes);
    }

    private function setting(string $key, ?string $value): void
    {
        if (! array_key_exists($key, $this->state['settings'])) {
            $this->state['settings'][$key] = Setting::where('key', $key)->exists()
                ? ['existed' => true, 'value' => Setting::where('key', $key)->value('value')]
                : ['existed' => false];
        }
        Setting::updateOrCreate(['key' => $key], ['value' => $value]);
    }

    private function day(int $offset): string
    {
        return now()->addDays($offset)->toDateString();
    }

    /* ------------------------------------------------------------------ */

    private function settings(): void
    {
        $this->line('• Site settings and photos');
        foreach ([
            'head_name' => 'Mrs. Grace Mollel',
            'head_photo' => $this->img('head'),
            'home_welcome_image' => $this->img('welcome'),
            'about_image' => $this->img('about'),
            'page_banner' => $this->img('banner'),
            'share_image' => $this->img('share'),
            'established' => 'Established 1990',
            'phone' => '+255 700 000 000',
            'phone_alt' => '+255 700 000 001',
            'email' => 'office@example.com',
            'instagram' => 'https://www.instagram.com',
            'whatsapp' => '255700000000',
            'history' => '<p>Enaboishu Secondary School opened its doors with two classrooms, four teachers and a community determined that its children would not have to travel far for a good secondary education.</p><h3>Growing with the community</h3><p>Over the years parents, former students and partners have helped build laboratories, a library and new classrooms. Today the school serves families from across the Arumeru District.</p><blockquote>Education for the Nation has always meant education for every child in our community.</blockquote><p><em>Demo text — replace with the school\'s real history in Site settings → About page.</em></p>',
        ] as $key => $value) {
            $this->setting($key, $value);
        }
    }

    private function home(): void
    {
        $this->line('• Hero slides, key figures, testimonials, notices');

        foreach (Slide::where('active', true)->get() as $slide) {
            $this->change($slide, ['active' => false]); // hidden while the demo slides show
        }
        $this->make(Slide::class, [
            'eyebrow' => 'Welcome to Enaboishu', 'title' => 'Education for the Nation',
            'subtitle' => 'A disciplined, caring school in the heart of Arusha, where every student is known, challenged and supported.',
            'image' => $this->img('hero-campus'), 'layout' => 'Full-width photo', 'image_caption' => null,
            'button_label' => 'Discover our school', 'button_url' => '/about', 'button2_label' => 'Apply online', 'button2_url' => '/apply', 'sort' => 1,
            'translations' => ['sw' => ['eyebrow' => 'Karibu Enaboishu', 'title' => 'Elimu kwa Taifa', 'subtitle' => 'Shule yenye nidhamu na upendo katikati ya Arusha, ambapo kila mwanafunzi anajulikana, anapewa changamoto na kusaidiwa.', 'button_label' => 'Ifahamu shule yetu', 'button2_label' => 'Omba mtandaoni']],
        ]);
        $this->make(Slide::class, [
            'eyebrow' => 'Admissions 2027', 'title' => 'Join the Enaboishu family',
            'subtitle' => 'Applications for Form One and Form Five are open. Apply online in five minutes and receive your reference by email.',
            'image' => $this->img('hero-savanna'), 'layout' => 'Arched photo', 'image_caption' => 'Sunset over the Arumeru plains',
            'button_label' => 'Apply online', 'button_url' => '/apply', 'button2_label' => 'Requirements', 'button2_url' => '/admissions', 'sort' => 2,
        ]);
        $this->make(Slide::class, [
            'eyebrow' => 'Academics', 'title' => 'Strong results, stronger readers',
            'subtitle' => 'A reading culture, regular assessment and dedicated teachers behind every NECTA result.',
            'image' => $this->img('hero-books'), 'layout' => 'Arched photo', 'image_caption' => 'The school library',
            'button_label' => 'See our results', 'button_url' => '/results', 'sort' => 3,
        ]);

        $values = ['Students' => '640+', 'Teachers and staff' => '38', 'Subjects taught' => '14', 'Years of service' => '35'];
        foreach (Stat::orderBy('sort')->get() as $stat) {
            if (isset($values[$stat->label])) {
                $this->change($stat, ['value' => $values[$stat->label], 'active' => true]);
            }
        }

        foreach ([
            ['Demo testimonial: the teachers know my daughter by name and call me when something needs attention. Her confidence has grown every term.', 'Mama Neema', 'Parent, Form Three', 'testimonial-1'],
            ['Demo testimonial: the debate club taught me to speak in front of people. Today I lead meetings at university without fear.', 'Daniel K.', 'Alumnus, class of 2018', 'testimonial-2'],
            ['Demo testimonial: discipline here is firm but fair. Students are expected to work hard, and they are helped to succeed.', 'Mzee Joseph', 'Parent and school board member', 'testimonial-3'],
        ] as $i => [$quote, $name, $role, $photo]) {
            $this->make(Testimonial::class, compact('quote', 'name', 'role') + ['photo' => $this->img($photo), 'sort' => $i]);
        }

        $this->make(Notice::class, [
            'message' => 'Demo notice: Term Two begins on Monday. Students report by 7:30 am in full uniform.', 'tone' => 'Important',
            'link_label' => 'Term dates', 'link_url' => '/events', 'starts_at' => $this->day(-1), 'ends_at' => $this->day(14),
            'translations' => ['sw' => ['message' => 'Tangazo la mfano: Muhula wa Pili unaanza Jumatatu. Wanafunzi wafike saa 1:30 asubuhi wakiwa na sare kamili.', 'link_label' => 'Tarehe za muhula']],
        ]);
        $this->make(Notice::class, [
            'message' => 'Demo notice: Form One joining instructions for 2027 are now available to download.', 'tone' => 'Information',
            'link_label' => 'Downloads', 'link_url' => '/downloads', 'starts_at' => $this->day(-3), 'ends_at' => $this->day(30), 'sort' => 1,
        ]);
    }

    private function people(): void
    {
        $this->line('• Staff, student leaders, alumni');
        $staff = [
            ['Mr. Peter Sumari', 'Second Master (Academics)', 'Leadership', 'Mathematics', 'Mathematics', 'Forms III–IV', 'Leads the academic programme and the school timetable. Twenty years in the classroom and a firm believer in daily practice.', 'staff-4'],
            ['Mrs. Agnes Lyimo', 'Discipline Mistress', 'Leadership', 'Languages', 'Kiswahili, History', 'Class teacher, Form 4A', 'Responsible for student welfare and discipline. Patron of the Kiswahili debating society.', 'staff-2'],
            ['Ms. Neema Mushi', 'Biology Teacher', 'Teaching', 'Sciences', 'Biology, Chemistry', 'Class teacher, Form 2A', 'Runs the Environmental Society and the school tree nursery. Believes every lesson should end with a question.', 'staff-1'],
            ['Mr. Baraka Mollel', 'Mathematics Teacher', 'Teaching', 'Mathematics', 'Basic Mathematics', 'Forms I–II', 'Coach of the school football team and the mathematics olympiad squad.', 'staff-3'],
            ['Ms. Rehema Laizer', 'English Teacher', 'Teaching', 'Languages', 'English, Literature', 'Class teacher, Form 3B', 'Patron of the English Debate Club. Organises the annual reading week and spelling competition.', 'staff-5'],
            ['Mr. Emmanuel Kimaro', 'Physics Teacher', 'Teaching', 'Sciences', 'Physics, Chemistry', 'Forms III–IV', 'Looks after the laboratories and the science fair. Previously taught in Moshi for eight years.', 'staff-6'],
            ['Ms. Halima Said', 'ICT Teacher', 'Teaching', 'Business Studies', 'Information and Computer Studies, Commerce', 'Forms I–IV', 'Runs the computer lab and the photography club. Keen to see every student type and code by Form Two.', 'staff-7'],
            ['Mr. Joseph Massawe', 'Bursar', 'Administration', null, null, null, 'Handles school fees, contributions and procurement. Visit the bursary office for fee statements.', 'staff-8'],
        ];
        foreach ($staff as $i => [$name, $position, $department, $academic, $subjects, $class, $bio, $photo]) {
            $this->make(StaffMember::class, [
                'name' => $name, 'position' => $position, 'department' => $department, 'academic_department' => $academic,
                'subjects' => $subjects, 'class_assigned' => $class, 'bio' => "Demo profile. {$bio}", 'photo' => $this->img($photo), 'sort' => $i + 1,
            ]);
        }

        foreach ([
            ['Demo Leader Amani', 'Head Prefect', 'Form 4A', 'Lead by example, not by title.', 'leader-1'],
            ['Demo Leader Zawadi', 'Head Girl', 'Form 4B', 'Every voice in this school matters.', 'leader-2'],
            ['Demo Leader Juma', 'Academic Prefect', 'Form 4A', null, 'leader-3'],
            ['Demo Leader Upendo', 'Sports Prefect', 'Form 3B', null, 'leader-4'],
        ] as $i => [$name, $role, $class, $quote, $photo]) {
            $this->make(StudentLeader::class, ['name' => $name, 'role' => $role, 'class_name' => $class, 'term' => '2026/2027', 'quote' => $quote, 'photo' => $this->img($photo), 'sort' => $i]);
        }

        foreach ([
            ['Dr. Rose Demo', 2008, 'Medical doctor', 'Mount Meru Regional Hospital', 'Arusha', 'Demo story: Enaboishu taught me to work hard when nobody was watching. Our biology teacher\'s lab sessions are the reason I chose medicine.', 'alumni-1', true, true],
            ['Eng. Michael Demo', 2012, 'Civil engineer', 'University of Dar es Salaam', 'Dar es Salaam', 'Demo story: I still use the study routine I learned in Form Four. To current students: read every day, even for ten minutes.', 'alumni-2', true, true],
            ['Asha Demo', 2016, 'Teacher', 'Moshi Co-operative University', 'Moshi', null, null, false, true],
            ['Daniel Demo', 2018, 'Software developer', 'Arusha Tech Hub', 'Arusha', null, null, false, false],
            ['Lucy Demo', 2019, 'Nursing student', 'KCMC University', 'Moshi', null, null, false, false],
            ['Pending Sign-up Demo', 2021, 'Student', null, null, 'Demo: this sign-up is waiting for approval and does not appear on the website.', null, false, false],
        ] as $i => [$name, $year, $job, $org, $where, $story, $photo, $featured, $mentor]) {
            $this->make(Alumnus::class, [
                'name' => $name, 'graduation_year' => $year, 'occupation' => $job, 'organisation' => $org, 'location' => $where,
                'story' => $story, 'photo' => $photo ? $this->img($photo) : null, 'featured' => $featured, 'mentor' => $mentor,
                'email' => 'alumni'.($i + 1).'@example.com', 'show_publicly' => true, 'approved' => ! str_starts_with($name, 'Pending'), 'sort' => $i,
            ]);
        }
    }

    private function updates(): void
    {
        $this->line('• News, articles, events, gallery');
        $news = [
            ['Music festival: our choir takes first place in the district', 'news-music', 'Demo story. The school choir and traditional dance group won the district secondary schools music festival with a performance about water conservation.', ['news-g1', 'news-g2', 'news-g3']],
            ['Agriculture club harvests its first maize crop', 'news-harvest', 'Demo story. Students in the agriculture club planted, weeded and harvested half an acre of maize on the school farm this term.', []],
            ['Form Four candidates complete their mock examinations', 'news-exams', 'Demo story. All 124 Form Four candidates sat the regional mock examinations. Results will be shared with parents at the next meeting.', ['news-g4']],
            ['New computers for the ICT laboratory', 'news-ict', 'Demo story. Thanks to the parents\' association, twenty new computers have been installed in the ICT laboratory.', []],
            ['Inter-house athletics: Kilimanjaro House wins the trophy', 'news-athletics', 'Demo story. A day of sprints, relays and long-distance races ended with Kilimanjaro House lifting the trophy for the second year running.', ['news-g5']],
        ];
        foreach ($news as $i => [$title, $cover, $excerpt, $photos]) {
            $this->make(Post::class, [
                'title' => $title, 'slug' => 'demo-'.\Illuminate\Support\Str::slug($title), 'excerpt' => $excerpt,
                'body' => "<p>The whole school community came together for this occasion, and the day was a credit to our students and staff.</p><h3>What happened</h3><p>Students prepared for weeks with their teachers. <strong>Parents and guests</strong> joined to support them, and the head of school thanked everyone who took part.</p><ul><li>Planned and led by students</li><li>Supported by teachers and parents</li><li>Celebrated at Monday assembly</li></ul><blockquote>We are proud of every student who took part.</blockquote><p><em>This is demo content created to preview the layout.</em></p>",
                'image' => $this->img($cover), 'photos' => array_map(fn ($p) => $this->img($p), $photos),
                'published_at' => $this->day(-($i * 4 + 1)),
                'translations' => $i === 0 ? ['sw' => ['title' => 'Tamasha la muziki: kwaya yetu yashika nafasi ya kwanza wilayani', 'excerpt' => 'Habari ya mfano. Kwaya ya shule na kikundi cha ngoma za asili walishinda tamasha la muziki la shule za sekondari wilayani.']] : null,
            ]);
        }

        foreach ([
            ['How to help your child prepare for national examinations', 'Mr. Peter Sumari, Second Master', 'For parents', 'article-1'],
            ['Why we teach Kiswahili and English side by side', 'Mrs. Agnes Lyimo', 'Languages', 'article-2'],
            ['Planting trees, growing leaders: a term with the Environmental Society', 'Ms. Neema Mushi', 'Student life', 'article-3'],
        ] as $i => [$title, $author, $category, $cover]) {
            $this->make(Article::class, [
                'title' => $title, 'slug' => 'demo-'.\Illuminate\Support\Str::slug($title), 'author' => $author, 'category' => $category,
                'excerpt' => 'Demo article to preview the layout of the Journal section and article pages.',
                'body' => '<p>Demo article. '.str_repeat('Good habits are built one day at a time, with patience, encouragement and a clear routine at home and at school. ', 6).'</p><h3>Three practical steps</h3><ol><li>Agree a fixed study time every evening.</li><li>Ask your child to teach you one thing they learned.</li><li>Talk to the class teacher early when something worries you.</li></ol><p>'.str_repeat('Small, steady steps lead to strong results. ', 8).'</p>',
                'image' => $this->img($cover), 'published_at' => $this->day(-($i * 6 + 2)),
            ]);
        }

        foreach ([
            ['Term Two opening day', 6, null, '7:30 am', 'School grounds', 'Students report in full uniform with their holiday package.', 'event-1'],
            ['Parents and guardians day', 13, null, '9:00 am – 1:00 pm', 'Main hall', 'Meet the class teachers, see your child\'s progress report and hear from the school board.', null],
            ['Form Two National Assessment (FTNA)', 25, 29, null, 'Examination hall', 'National assessment for all Form Two students.', null],
            ['Inter-school debate championship', 40, null, '2:00 pm', 'School library', 'Our English and Kiswahili debate clubs host four schools from the region.', 'event-2'],
            ['Science fair', -12, null, '10:00 am', 'Laboratories', 'Students presented 30 projects to judges from the district office.', null],
        ] as [$title, $start, $end, $time, $where, $summary, $cover]) {
            $this->make(Event::class, [
                'title' => $title, 'slug' => 'demo-'.\Illuminate\Support\Str::slug($title), 'starts_at' => $this->day($start), 'ends_at' => $end ? $this->day($end) : null,
                'time' => $time, 'location' => $where, 'summary' => "Demo event. {$summary}",
                'description' => "<p>Demo event. {$summary}</p><p>For questions please contact the school office.</p>",
                'image' => $cover ? $this->img($cover) : null,
            ]);
        }

        $captions = ['The main campus', 'Sunset over the school farm', 'Field trip to the mountains', 'Our neighbouring hills', 'Morning run', 'District music festival', 'Music club rehearsal', 'Photography club', 'Cultural day', 'Reflection by the lake', 'Tree planting', 'Library study time'];
        $cats = ['Campus', 'Campus', 'Trips', 'Campus', 'Sports', 'Events', 'Clubs', 'Clubs', 'Events', 'Trips', 'Clubs', 'Academics'];
        foreach ($captions as $i => $caption) {
            $this->make(GalleryItem::class, ['caption' => "{$caption} (demo)", 'category' => $cats[$i], 'image' => $this->img('gallery-'.($i + 1)), 'sort' => $i]);
        }
    }

    private function studentLife(): void
    {
        $this->line('• Clubs and sports');
        foreach ([
            ['English Debate Club', 'Club', 'Weekly debates in English that build confidence, reasoning and public speaking.', 'Ms. Rehema Laizer', 'Thursdays, 4:00 pm', "District debate champions 2025\nBest speaker award, regional finals", 'club-debate'],
            ['Music and Choir', 'Club', 'Choir, traditional dance and instruments, performing at school events and festivals.', 'Mr. Emmanuel Kimaro', 'Tuesdays and Fridays, 4:00 pm', 'First place, district music festival', 'club-music'],
            ['Photography Club', 'Club', 'Students learn to tell stories with a camera and document school life.', 'Ms. Halima Said', 'Wednesdays, 4:00 pm', null, 'club-photo'],
            ['Environmental Society', 'Society', 'Tree planting, a school nursery and clean-up days in the community.', 'Ms. Neema Mushi', 'Saturdays, 9:00 am', '1,200 trees planted since 2023', 'club-environment'],
            ['Football', 'Sport', 'Boys\' and girls\' teams training for district and regional competitions.', 'Mr. Baraka Mollel', 'Mondays to Thursdays, 4:30 pm', "UMISSETA district runners-up 2025", 'club-football'],
            ['Athletics', 'Sport', 'Sprints, relays and long-distance running for every form.', 'Mr. Peter Sumari', 'Early mornings, 6:00 am', 'Three students selected for the regional team', 'club-athletics'],
        ] as $i => [$name, $kind, $summary, $patron, $meets, $achievements, $cover]) {
            $this->make(Club::class, [
                'name' => $name, 'kind' => $kind, 'summary' => "Demo. {$summary}", 'patron' => $patron, 'meets' => $meets, 'achievements' => $achievements,
                'description' => "<p>Demo description. {$summary} New members are welcome at the start of every term.</p>", 'image' => $this->img($cover),
                'photos' => $i < 2 ? [$this->img('gallery-6'), $this->img('gallery-7')] : [], 'sort' => $i,
            ]);
        }
    }

    private function academics(): void
    {
        $this->line('• Facilities, results, downloads');
        $photos = ['Classrooms' => 'facility-classrooms', 'Science laboratories' => 'facility-labs', 'Library' => 'facility-library', 'Sports and recreation' => 'facility-sports'];
        foreach (Facility::all() as $facility) {
            if (isset($photos[$facility->title])) {
                $this->change($facility, ['image' => $this->img($photos[$facility->title])]);
            }
        }

        foreach ([[2021, 98, 9, 22, 38, 21, 8, '3.21'], [2022, 104, 12, 27, 37, 20, 8, '3.10'], [2023, 112, 15, 31, 38, 20, 8, '2.98'], [2024, 118, 19, 36, 36, 19, 8, '2.87'], [2025, 124, 24, 41, 35, 18, 6, '2.71']] as [$year, $c, $d1, $d2, $d3, $d4, $d0, $gpa]) {
            if (! Result::where('year', $year)->where('exam', 'CSEE')->exists()) {
                $this->make(Result::class, ['year' => $year, 'exam' => 'CSEE', 'candidates' => $c, 'div_1' => $d1, 'div_2' => $d2, 'div_3' => $d3, 'div_4' => $d4, 'div_0' => $d0, 'gpa' => $gpa,
                    'rank_note' => $year === 2025 ? 'Demo: 12th of 98 schools in Arusha Region' : null, 'notes' => $year === 2025 ? 'Demo figures to preview the layout — replace with official NECTA results.' : null]);
            }
        }
        if (! Result::where('year', 2025)->where('exam', 'FTNA')->exists()) {
            $this->make(Result::class, ['year' => 2025, 'exam' => 'FTNA', 'candidates' => 131, 'div_1' => 18, 'div_2' => 39, 'div_3' => 42, 'div_4' => 25, 'div_0' => 7, 'gpa' => null]);
        }

        foreach ([
            ['Form One Joining Instructions 2027 (demo)', 'Joining instructions', 'Form I', 'What to bring, reporting dates and uniform requirements.'],
            ['Form Two December Holiday Package (demo)', 'Holiday package', 'Form II', null],
            ['CSEE 2024 Biology Past Paper (demo)', 'Past paper', 'Form IV', null],
            ['Fee and contribution schedule 2027 (demo)', 'Fee schedule', 'All forms', 'Fees, contributions and payment instructions.'],
            ['Admission application form (demo)', 'Application form', 'All forms', null],
        ] as $i => [$title, $category, $form, $description]) {
            $path = 'demo/document-'.($i + 1).'.pdf';
            $pdf = $this->pdf($title);
            Storage::disk('uploads')->put($path, $pdf);
            $this->make(Download::class, ['title' => $title, 'category' => $category, 'form_level' => $form, 'description' => $description,
                'file' => $path, 'file_size' => strlen($pdf), 'file_type' => 'PDF', 'downloads_count' => [214, 58, 131, 97, 12][$i], 'sort' => $i]);
        }
    }

    private function inbox(): void
    {
        $this->line('• Admin inbox: enquiries, messages, notification recipients');
        foreach ([
            ['Demo Student Neema', 'Form I', 'Demo Parent Joseph', 'New'],
            ['Demo Student Baraka', 'Form I', 'Demo Parent Agnes', 'Contacted'],
            ['Demo Student Rehema', 'Form V', 'Demo Parent Halima', 'Visit booked'],
            ['Demo Student Amani', 'Form II', 'Demo Parent Peter', 'Admitted'],
        ] as $i => [$student, $class, $parent, $status]) {
            $this->make(Enquiry::class, [
                'reference' => sprintf('DEMO-%d-%04d', now()->year, $i + 1), 'student_name' => $student, 'class_applying' => $class,
                'gender' => $i % 2 ? 'Male' : 'Female', 'guardian_name' => $parent, 'relationship' => 'Parent', 'phone' => '0700 000 00'.$i,
                'email' => 'parent'.($i + 1).'@example.com', 'address' => 'Arumeru, Arusha', 'status' => $status, 'status_changed_at' => now(),
                'message' => $i === 0 ? 'Demo enquiry: is there space for a day student in Form One?' : null,
            ]);
        }
        $this->make(Message::class, ['name' => 'Demo Visitor', 'email' => 'visitor@example.com', 'phone' => '0700 000 010', 'subject' => 'Visiting day', 'body' => 'Demo message: when can parents visit the school before applying?']);
        $this->make(Message::class, ['name' => 'Demo Alumna', 'email' => 'alumna@example.com', 'subject' => 'Career talk', 'body' => 'Demo message: I would like to give a career talk to Form Four students.', 'read_at' => now()]);

        $this->make(NotificationRecipient::class, ['name' => 'Demo Head of School', 'title' => 'Head of School', 'email' => 'head@example.com']);
        $this->make(NotificationRecipient::class, ['name' => 'Demo Secretary', 'title' => 'Secretary', 'email' => 'secretary@example.com', 'on_alumni' => false, 'sort' => 1]);
    }

    /** A tiny, valid one-page PDF so the download links work. */
    private function pdf(string $title): string
    {
        $text = str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], 'Demo document: '.$title);
        $stream = "BT /F1 16 Tf 60 760 Td ({$text}) Tj 0 -28 Td /F1 11 Tf (Enaboishu Secondary School - preview file, replace with the real document.) Tj ET";
        $objects = [
            '<< /Type /Catalog /Pages 2 0 R >>',
            '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
            '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
            '<< /Length '.strlen($stream)." >>\nstream\n{$stream}\nendstream",
            '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
        ];
        $pdf = "%PDF-1.4\n";
        $offsets = [];
        foreach ($objects as $i => $object) {
            $offsets[] = strlen($pdf);
            $pdf .= ($i + 1)." 0 obj\n{$object}\nendobj\n";
        }
        $xref = strlen($pdf);
        $pdf .= "xref\n0 ".(count($objects) + 1)."\n0000000000 65535 f \n";
        foreach ($offsets as $o) {
            $pdf .= sprintf("%010d 00000 n \n", $o);
        }

        return $pdf."trailer\n<< /Size ".(count($objects) + 1)." /Root 1 0 R >>\nstartxref\n{$xref}\n%%EOF\n";
    }

    /* ------------------------------------------------------------------ */

    private function clear(): int
    {
        if (! Storage::disk('local')->exists($this->stateFile())) {
            $this->info('No demo content is installed.');

            return self::SUCCESS;
        }
        $state = json_decode(Storage::disk('local')->get($this->stateFile()), true);

        $removed = 0;
        foreach ($state['created'] ?? [] as $model => $ids) {
            $removed += $model::whereIn('id', $ids)->delete();
        }
        foreach ($state['changed'] ?? [] as $key => $old) {
            [$model, $id] = explode('#', $key);
            $model::whereKey($id)->update($old);
        }
        foreach ($state['settings'] ?? [] as $key => $previous) {
            $previous['existed']
                ? Setting::where('key', $key)->update(['value' => $previous['value']])
                : Setting::where('key', $key)->delete();
        }
        Storage::disk('local')->delete($this->stateFile());
        Site::forget();

        $this->info("Demo content removed ({$removed} items) and previous settings restored. The demo files stay in public/uploads/demo (other databases may use them); delete that folder yourself once nothing uses it.");

        return self::SUCCESS;
    }
}
