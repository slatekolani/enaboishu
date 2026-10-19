import { Link } from '@inertiajs/react';
import SiteLayout from '@/Layouts/SiteLayout';
import HeroCarousel from '@/Components/site/HeroCarousel';
import Logo from '@/Components/site/Logo';
import Seal from '@/Components/site/Seal';
import CountUp from '@/Components/site/CountUp';
import { ArrowLink, Ornament, Photo, Prose, SectionHeading, fmtDate } from '@/Components/site/Parts';
import { lines, useMedia, useSite } from '@/lib/site';
import RichText from '@/Components/site/RichText';
import { ArticlesJournal, EventsCalendar, NewsGazette } from '@/Components/site/HomeUpdates';
import type { Article, Post, Program, SchoolEvent, Slide, Stat, Testimonial } from '@/types/cms';

interface Props {
    slides: Slide[];
    stats: Stat[];
    programs: Program[];
    posts: Post[];
    articles: Article[];
    events: SchoolEvent[];
    testimonials: Testimonial[];
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];

function SmartLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
    return /^https?:/i.test(href) ? <a href={href} className={className}>{children}</a> : <Link href={href} className={className}>{children}</Link>;
}

export default function Home({ slides, stats, programs, posts, events, articles, testimonials }: Props) {
    const site = useSite();
    const media = useMedia();
    // Sections can be switched off in Site settings → Home page sections.
    const show = (section: string) => site[`home_show_${section}`] !== 'Hide';
    const welcomeImage = media(site.home_welcome_image);
    const headPhoto = media(site.head_photo);
    const headInitials = (site.head_name ?? '')
        .replace(/^(mr|mrs|ms|miss|dr|prof|rev|sr|br)\.?\s+/i, '')
        .split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
    const sealText = `${(site.site_name ?? '').toUpperCase()} · ${(site.motto ?? '').toUpperCase()} · `;
    const quickLinks = lines(site.quick_links)
        .map((l) => l.split('|').map((p) => p.trim()))
        .filter((p) => p[0] && p[2])
        .slice(0, 4);

    return (
        <SiteLayout title={site.site_name ?? undefined}>
            <HeroCarousel slides={slides} />

            {/* Quick links: a white panel resting on the bottom edge of the slideshow */}
            {show('quick_links') && quickLinks.length > 0 && (
                <section aria-label="Quick links" className="relative z-30 pt-14 sm:pt-16">
                    <div className="container-site">
                        <div data-reveal-group data-reveal-step="120" className={`grid border border-rule bg-white shadow-[0_24px_48px_-28px_rgba(8,22,44,0.45)] sm:grid-cols-2 ${quickLinks.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
                            {quickLinks.map(([title, text, href], i) => (
                                <SmartLink
                                    key={title}
                                    href={href}
                                    className="group relative border-rule p-7 transition-colors hover:bg-crest-50 sm:[&:nth-child(odd)]:border-r lg:border-r lg:last:border-r-0 [&:not(:last-child)]:border-b sm:[&:nth-last-child(-n+2)]:border-b-0 lg:!border-b-0"
                                >
                                    <span className="font-serif text-sm italic text-brass">{ROMAN[i]}.</span>
                                    <span className="mt-1 block font-serif text-[1.65rem] font-semibold leading-tight text-navy-900">{title}</span>
                                    <span className="mt-2 block text-[15px] leading-snug text-slate-600">{text}</span>
                                    <span className="absolute bottom-0 left-0 h-[3px] w-0 bg-navy-900 transition-all duration-300 group-hover:w-full" />
                                </SmartLink>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Welcome: words on the left, photo (if any) on the right */}
            {show('welcome') && (
            <section className="py-20 sm:py-28">
                <div className="container-site grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
                    <div className={welcomeImage ? 'lg:col-span-7' : 'lg:col-span-12 lg:grid lg:grid-cols-12 lg:gap-20'}>
                        <div className={welcomeImage ? '' : 'lg:col-span-5'}>
                            <SectionHeading eyebrow={site.home_welcome_eyebrow} title={site.home_welcome_title ?? ''} />
                        </div>
                        <div className={welcomeImage ? 'mt-10' : 'mt-10 lg:col-span-7 lg:mt-12'} data-reveal>
                            <Prose text={site.home_welcome_text} lead />
                            <div className="mt-10">{site.home_welcome_link && <ArrowLink href={route('about')}>{site.home_welcome_link}</ArrowLink>}</div>
                        </div>
                    </div>
                    {welcomeImage && (
                        <div className="lg:col-span-5" data-reveal="right">
                            <div className="relative mx-auto max-w-md">
                                <div aria-hidden className="absolute -bottom-4 -right-4 h-full w-full border border-brass/60" />
                                <Photo src={welcomeImage} ratio="aspect-[4/5]" className="relative" alt={site.site_name ?? ""} />
                            </div>
                        </div>
                    )}
                </div>
            </section>
            )}

            {show('stats') && stats.length > 0 && (
                <section aria-label="The school in numbers" className="border-y border-rule bg-white">
                    <dl className="container-site grid grid-cols-2 lg:grid-cols-4" data-reveal-group data-reveal-step="120">
                        {stats.map((s) => (
                            <div key={s.id} className="flex flex-col-reverse items-center border-rule px-4 py-10 text-center [&:not(:last-child)]:lg:border-r">
                                <dt className="mt-2 text-[11.5px] font-semibold uppercase tracking-[0.22em] text-slate-500">{s.label}</dt>
                                <dd className="font-serif text-6xl font-semibold text-navy-900"><CountUp value={s.value} /></dd>
                            </div>
                        ))}
                    </dl>
                </section>
            )}

            {/* Motto */}
            {show('motto') && site.motto && (
                <section className="relative overflow-hidden bg-crest-100 py-20 sm:py-24">
                    <div className="container-site relative text-center" data-reveal-group data-reveal-step="130">
                        <div data-reveal="zoom"><Logo className="mx-auto h-20" /></div>
                        {site.motto_eyebrow && <p className="eyebrow mt-8">{site.motto_eyebrow}</p>}
                        <p className="mx-auto mt-4 max-w-4xl font-serif text-5xl font-semibold italic leading-[1.05] text-navy-900 sm:text-7xl">{site.motto}</p>
                        <Ornament className="mx-auto mt-8 text-navy-700" width="w-40" />
                        {site.motto_text && <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-navy-800">{site.motto_text}</p>}
                    </div>
                </section>
            )}

            {/* Head of school: portrait beside the message */}
            {show('head') && site.head_message && (
                <section aria-label={site.head_eyebrow ?? undefined} className="relative overflow-hidden py-20 sm:py-28">
                    <div aria-hidden className="ground-navy absolute inset-x-0 top-0 h-[17rem] sm:h-[20rem] lg:inset-y-0 lg:right-auto lg:h-auto lg:w-[38%]" />
                    <div className="container-site relative grid items-center gap-16 lg:grid-cols-12 lg:gap-20">
                        <div className="lg:col-span-5" data-reveal="left">
                            <div className="relative mx-auto w-full max-w-[16rem] sm:max-w-[20rem] lg:max-w-[23rem]">
                                <div aria-hidden className="absolute -inset-4 rounded-t-full border border-crest-300/50 sm:-inset-5" />
                                <div aria-hidden className="absolute inset-0 translate-x-4 translate-y-4 rounded-t-full bg-brass/25 sm:translate-x-6 sm:translate-y-6" />
                                <div className="relative aspect-[4/5] overflow-hidden rounded-t-full bg-crest-100 shadow-[0_30px_60px_-30px_rgba(8,22,44,0.7)]" data-reveal="curtain">
                                    {headPhoto ? (
                                        <img src={headPhoto} alt={site.head_name ?? site.head_title ?? ''} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="bg-school flex h-full w-full flex-col items-center justify-center gap-5">
                                            {headInitials ? (
                                                <span className="font-serif text-[5.5rem] font-semibold leading-none text-navy-700">{headInitials}</span>
                                            ) : (
                                                <Logo className="h-28" />
                                            )}
                                            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-crest-700">{site.head_title}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-8 -right-6 sm:-right-10">
                                    <Seal text={sealText} className="h-24 w-24 sm:h-28 sm:w-28" />
                                </div>
                            </div>
                        </div>

                        <figure className="lg:col-span-7" data-reveal-group data-reveal-step="140">
                            {site.head_eyebrow && <p className="eyebrow">{site.head_eyebrow}</p>}
                            <svg aria-hidden width="52" height="40" viewBox="0 0 46 36" className="mt-6 text-crest-300">
                                <path fill="currentColor" d="M0 36V22C0 9 7 2 19 0l2 5c-7 2-10 6-10 12h9v19H0zm25 0V22C25 9 32 2 44 0l2 5c-7 2-10 6-10 12h9v19H25z" />
                            </svg>
                            <blockquote className="mt-6">
                                <RichText html={site.head_message} className="!font-serif !text-[1.5rem] !leading-[1.55] !text-navy-900 sm:!text-[1.75rem]" />
                            </blockquote>
                            <figcaption className="mt-10 flex items-center gap-5">
                                <span className="h-px w-14 bg-brass" />
                                <span>
                                    {site.head_name && <span className="block font-serif text-[1.9rem] italic leading-tight text-navy-900">{site.head_name}</span>}
                                    <span className="mt-1 block text-[11.5px] font-semibold uppercase tracking-[0.22em] text-slate-500">{site.head_title}</span>
                                </span>
                            </figcaption>
                        </figure>
                    </div>
                </section>
            )}

            {/* Programmes */}
            {show('programs') && programs.length > 0 && (
                <section className="ground-navy py-20 text-white sm:py-28">
                    <div className="container-site">
                        <SectionHeading eyebrow={site.programs_eyebrow} title={site.programs_title ?? ''} align="center" light>{site.programs_text}</SectionHeading>
                        <div className="mt-16 grid gap-px bg-white/10 md:grid-cols-3" data-reveal-group data-reveal-step="150">
                            {programs.slice(0, 3).map((p, i) => (
                                <article key={p.id} className="bg-navy-900 p-9">
                                    <span className="font-serif text-2xl italic text-crest-300">{ROMAN[i]}</span>
                                    <h3 className="mt-3 text-[1.9rem] leading-tight !text-white">{p.title}</h3>
                                    <p className="mt-2 text-[11.5px] font-semibold uppercase tracking-[0.2em] text-crest-300">{p.level}</p>
                                    {p.summary && <p className="mt-5 leading-relaxed text-navy-100">{p.summary}</p>}
                                    {lines(p.subjects).length > 0 && (
                                        <ul className="mt-6 border-t border-white/15 text-[15px] text-navy-100">
                                            {lines(p.subjects).map((s) => <li key={s} className="border-b border-white/10 py-2">{s}</li>)}
                                        </ul>
                                    )}
                                </article>
                            ))}
                        </div>
                        <div className="mt-12 text-center" data-reveal>{site.programs_link && <ArrowLink href={route('academics')} light>{site.programs_link}</ArrowLink>}</div>
                    </div>
                </section>
            )}

            {show('news') && <NewsGazette posts={posts} />}
            {show('events') && <EventsCalendar events={events} />}
            {show('articles') && <ArticlesJournal articles={articles} />}

            {/* Testimonials */}
            {show('testimonials') && testimonials.length > 0 && (
                <section className="py-20 sm:py-28">
                    <div className="container-site">
                        <SectionHeading eyebrow={site.testimonials_eyebrow} title={site.testimonials_title ?? ''} align="center" />
                        <div className="mt-16 grid gap-12 md:grid-cols-3" data-reveal-group data-reveal-step="150">
                            {testimonials.slice(0, 3).map((t) => (
                                <figure key={t.id} className="text-center">
                                    <blockquote className="font-serif text-[1.4rem] italic leading-[1.5] text-navy-900">“{t.quote}”</blockquote>
                                    <figcaption className="mt-6 flex flex-col items-center gap-3">
                                        {t.photo && <img src={media(t.photo) ?? ''} alt="" className="h-14 w-14 rounded-full object-cover ring-1 ring-rule ring-offset-4" />}
                                        <span>
                                            <span className="block font-semibold text-navy-900">{t.name}</span>
                                            {t.role && <span className="block text-[11.5px] font-semibold uppercase tracking-[0.2em] text-slate-500">{t.role}</span>}
                                        </span>
                                    </figcaption>
                                </figure>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Call to action */}
            {show('cta') && (
            <section className="bg-white py-20">
                <div className="container-site">
                    <div className="border border-navy-900 p-2" data-reveal="zoom">
                        <div className="border border-navy-900/30 px-6 py-14 text-center sm:px-16">
                            {site.cta_eyebrow && <p className="eyebrow">{site.cta_eyebrow}</p>}
                            <h2 className="mx-auto mt-4 max-w-3xl text-4xl leading-tight sm:text-5xl">{site.cta_title}</h2>
                            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">{site.cta_text}</p>
                            <div className="mt-10 flex flex-wrap justify-center gap-3">
                                <Link href={route('admissions')} className="btn-primary">{site.cta_label}</Link>
                                <Link href={route('contact')} className="btn-outline">{site.cta_secondary}</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            )}
        </SiteLayout>
    );
}
