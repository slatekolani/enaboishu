<?php

namespace Database\Seeders;

use App\Models\{Article, CoreValue, Facility, Post, Program, Slide, Stat, User};
use Illuminate\Database\Seeder;

/**
 * Starter content so the site looks complete on first launch.
 * Everything here is editable (or removable) from the admin panel.
 * Nothing factual about the school (figures, results, people) is invented:
 * the key-figures strip is seeded hidden so the school can enter its real numbers.
 */
class SiteSeeder extends Seeder
{
    public function run(): void
    {
        if (Slide::count() === 0) {
            foreach ([
                ['Enaboishu Secondary School', 'Learning with purpose in Arusha', 'A disciplined, caring school community where every student is expected to do well, and is supported to get there.', 'About our school', '/about'],
                ['Admissions', 'Join the Enaboishu family', 'Find out how to apply for a place, what documents you need and who to speak to at the school office.', 'How to apply', '/admissions'],
                ['School life', 'More than the classroom', 'Clubs, sport, leadership and service help our students grow in confidence and character.', 'See the gallery', '/gallery'],
            ] as $i => [$eyebrow, $title, $subtitle, $label, $url]) {
                Slide::create(compact('eyebrow', 'title', 'subtitle') + ['button_label' => $label, 'button_url' => $url, 'button2_label' => 'Contact us', 'button2_url' => '/contact', 'sort' => $i]);
            }
        }

        if (Stat::count() === 0) {
            foreach ([['Students', '000'], ['Teachers and staff', '00'], ['Subjects taught', '00'], ['Years of service', '00']] as $i => [$label, $value]) {
                // Hidden until the school replaces these placeholders with real figures.
                Stat::create(compact('label', 'value') + ['sort' => $i, 'active' => false]);
            }
        }

        if (Program::count() === 0) {
            Program::create([
                'title' => 'Languages and Humanities', 'level' => 'Ordinary Level (Form I–IV)', 'sort' => 1,
                'summary' => 'Strong communication and a clear understanding of society, history and citizenship.',
                'subjects' => "Kiswahili\nEnglish Language\nHistory\nGeography\nCivics",
            ]);
            Program::create([
                'title' => 'Mathematics and Sciences', 'level' => 'Ordinary Level (Form I–IV)', 'sort' => 2,
                'summary' => 'Practical, problem-centred teaching in the core sciences and mathematics.',
                'subjects' => "Basic Mathematics\nBiology\nChemistry\nPhysics",
            ]);
            Program::create([
                'title' => 'Business and Technology', 'level' => 'Ordinary Level (Form I–IV)', 'sort' => 3,
                'summary' => 'Skills for work and enterprise, and for a world increasingly shaped by technology.',
                'subjects' => "Commerce\nBook-keeping\nInformation and Computer Studies",
            ]);
        }

        if (Facility::count() === 0) {
            foreach ([
                ['Classrooms', 'Bright, well-organised classrooms for focused teaching and learning.'],
                ['Science laboratories', 'Practical work in Biology, Chemistry and Physics.'],
                ['Library', 'A quiet space for reading, research and private study.'],
                ['Sports and recreation', 'Playing fields and space for football, netball, athletics and more.'],
            ] as $i => [$title, $description]) {
                Facility::create(compact('title', 'description') + ['sort' => $i]);
            }
        }

        if (CoreValue::count() === 0) {
            foreach ([
                ['Excellence', 'We aim high in learning, effort and conduct, and we support every student to reach their potential.'],
                ['Discipline', 'Order, punctuality and self-control are the foundations of a good education.'],
                ['Integrity', 'We value honesty, fairness and doing the right thing when no one is watching.'],
                ['Respect', 'We treat others with dignity, and we honour our culture, our teachers and our community.'],
                ['Service', 'We prepare students to contribute to their families, their communities and Tanzania.'],
            ] as $i => [$title, $description]) {
                CoreValue::create(compact('title', 'description') + ['sort' => $i]);
            }
        }

        if (Post::count() === 0) {
            Post::create([
                'title' => 'Welcome to the new school website',
                'slug' => 'welcome-to-the-new-school-website',
                'excerpt' => 'Parents, students and friends of Enaboishu can now find news, events and admissions information in one place.',
                'body' => '<p>We are pleased to launch the new Enaboishu Secondary School website.</p><p>Here you will find information about our school, our teachers, how to apply, and the latest news and dates. We will keep this page up to date, so please check back often.</p><p>If you have questions, please use the <a href="/contact">contact page</a> to reach the school office.</p>',
                'published_at' => now()->toDateString(),
            ]);
        }

        if (Article::count() === 0) {
            Article::create([
                'title' => 'Five ways to support your child\'s learning at home',
                'slug' => 'five-ways-to-support-your-childs-learning-at-home',
                'author' => 'The School Office',
                'category' => 'For parents',
                'excerpt' => 'Small, steady habits at home make a real difference to how students learn at school.',
                'body' => '<p>Parents and guardians are a student\'s first and most important teachers. These simple habits help.</p>'
                    .'<h3>1. Keep a regular study time</h3><p>A fixed hour each evening, in a quiet place, builds the habit of revision.</p>'
                    .'<h3>2. Ask about the school day</h3><p>Ask <em>what did you learn today?</em> rather than <em>how was school?</em> Explaining a lesson helps a student remember it.</p>'
                    .'<h3>3. Read together</h3><p>Reading in <strong>Kiswahili and English</strong> strengthens vocabulary in every subject.</p>'
                    .'<h3>4. Protect sleep</h3><p>Well-rested students concentrate better and behave better in class.</p>'
                    .'<h3>5. Stay in touch with teachers</h3><p>Attend parents\' meetings and contact the school early if you have a concern.</p>',
                'published_at' => now()->toDateString(),
            ]);
        }

        $this->admin();
    }

    private function admin(): void
    {
        $email = env('ADMIN_EMAIL', 'admin@enaboishu.sc.tz');
        $password = env('ADMIN_PASSWORD');

        if (! $password || User::where('email', $email)->exists()) {
            return;
        }

        $user = User::create(['name' => 'Site Administrator', 'email' => $email, 'password' => $password]);
        $user->assignRole('admin');
    }
}
