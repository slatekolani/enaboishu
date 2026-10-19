import { useState } from 'react';
import SiteLayout from '@/Layouts/SiteLayout';
import { Empty, PageBanner, SectionHeading } from '@/Components/site/Parts';
import CountUp from '@/Components/site/CountUp';
import { useSite } from '@/lib/site';
import { cn } from '@/lib/utils';
import type { ExamResult } from '@/types/cms';

/*
 * Divisions are ordered (I is best), so they use one hue stepping light → dark, darkest for
 * Division I, with a warm neutral for Division 0. Checked with the dataviz palette validator
 * against the page surface: adjacent pairs pass for colour-blind and normal vision. The two
 * light steps are below 3:1 contrast, so every segment wide enough carries its percentage,
 * and the full figures are always available in the table below.
 */
const DIVS = [
    { key: 'div_1', name: 'I', fill: '#0d2140', ink: '#ffffff' },
    { key: 'div_2', name: 'II', fill: '#2d5a8c', ink: '#ffffff' },
    { key: 'div_3', name: 'III', fill: '#6f9bcb', ink: '#0d2140' },
    { key: 'div_4', name: 'IV', fill: '#b7d0ea', ink: '#0d2140' },
    { key: 'div_0', name: '0', fill: '#8c7a5b', ink: '#ffffff' },
] as const;

const EXAM_ORDER: ExamResult['exam'][] = ['CSEE', 'FTNA', 'ACSEE'];

const passRate = (r: ExamResult) => (r.candidates ? ((r.div_1 + r.div_2 + r.div_3 + r.div_4) / r.candidates) * 100 : 0);
const pct = (n: number, total: number) => (total ? (n / total) * 100 : 0);
const fmtPct = (n: number) => `${n.toFixed(n >= 99.95 || n === 0 ? 0 : 1)}%`;

function Tile({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="border-t-[3px] border-navy-900 bg-white px-6 py-7">
            <dd className="font-serif text-5xl font-semibold leading-none text-navy-900">{children}</dd>
            <dt className="mt-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</dt>
        </div>
    );
}

function DivisionChart({ rows }: { rows: ExamResult[] }) {
    const site = useSite();
    const [hover, setHover] = useState<{ row: number; div: number } | null>(null);
    const divLabel = (i: number) => (DIVS[i].name === '0' ? site.results_div0 : `${site.results_division} ${DIVS[i].name}`);

    return (
        <figure>
            {site.results_trend_title && <figcaption className="mb-6 font-serif text-[1.9rem] font-semibold text-navy-900">{site.results_trend_title}</figcaption>}

            {/* Legend: always present, in division order */}
            <ul className="mb-8 flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-slate-700">
                {DIVS.map((d, i) => (
                    <li key={d.key} className="flex items-center gap-2">
                        <span aria-hidden className="h-3.5 w-3.5 rounded-[3px]" style={{ background: d.fill }} />
                        {divLabel(i)}
                    </li>
                ))}
            </ul>

            <div className="space-y-4">
                {rows.map((r, ri) => (
                    <div key={r.id} className="grid grid-cols-[3.5rem_1fr] items-center gap-4 sm:grid-cols-[4.5rem_1fr_5.5rem]">
                        <div className="font-serif text-2xl font-semibold text-navy-900">{r.year}</div>
                        <div className="relative flex h-11 gap-[2px]" role="img" aria-label={`${r.year}: ${DIVS.map((d, i) => `${divLabel(i)} ${r[d.key]}`).join(', ')}`}>
                            {DIVS.map((d, di) => {
                                const share = pct(r[d.key], r.candidates);
                                if (share === 0) return null;
                                const isHover = hover?.row === ri && hover.div === di;
                                return (
                                    <div
                                        key={d.key}
                                        tabIndex={0}
                                        onMouseEnter={() => setHover({ row: ri, div: di })}
                                        onMouseLeave={() => setHover(null)}
                                        onFocus={() => setHover({ row: ri, div: di })}
                                        onBlur={() => setHover(null)}
                                        className={cn('relative flex items-center justify-center text-[12.5px] font-semibold outline-none transition-opacity first:rounded-l-[4px] last:rounded-r-[4px]', hover && !isHover && 'opacity-60')}
                                        style={{ width: `${share}%`, background: d.fill, color: d.ink }}
                                    >
                                        {share >= 7 && <span className="tabular-nums">{Math.round(share)}%</span>}
                                        {isHover && (
                                            <span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 bg-navy-950 px-3 py-2 text-left text-[13px] font-normal text-white shadow-lg">
                                                <span className="block font-semibold">{divLabel(di)} · {r.year}</span>
                                                <span className="tabular-nums">{r[d.key].toLocaleString()} {site.results_candidates?.toLowerCase()} ({fmtPct(share)})</span>
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="hidden text-right sm:block">
                            <div className="font-serif text-xl font-semibold tabular-nums text-navy-900">{fmtPct(passRate(r))}</div>
                            <div className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-slate-500">{site.results_pass_rate}</div>
                        </div>
                    </div>
                ))}
            </div>
        </figure>
    );
}

export default function Results({ results }: { results: ExamResult[] }) {
    const site = useSite();
    const examLabel = (e: ExamResult['exam']) => site[`results_label_${e.toLowerCase()}`] ?? e;
    const exams = EXAM_ORDER.filter((e) => results.some((r) => r.exam === e));
    const [exam, setExam] = useState<ExamResult['exam']>(exams[0] ?? 'CSEE');
    const rows = results.filter((r) => r.exam === exam).sort((a, b) => b.year - a.year);
    const latest = rows[0];

    return (
        <SiteLayout title={site.results_title ?? ''}>
            <PageBanner title={site.results_title ?? ''} crumb={site.nav_results ?? ''} intro={site.results_intro} page="results" />

            <div className="py-16 sm:py-20">
                <div className="container-site">
                    {results.length === 0 ? (
                        <Empty>{site.results_empty}</Empty>
                    ) : (
                        <>
                            {exams.length > 1 && (
                                <div className="mb-14 flex flex-wrap justify-center gap-2" role="tablist">
                                    {exams.map((e) => (
                                        <button
                                            key={e}
                                            role="tab"
                                            aria-selected={e === exam}
                                            onClick={() => setExam(e)}
                                            className={cn('border px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.16em] transition-colors', e === exam ? 'border-navy-900 bg-navy-900 text-white' : 'border-rule bg-white text-slate-600 hover:border-navy-900')}
                                        >
                                            {examLabel(e)}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {latest && (
                                <section key={`latest-${exam}`} className="grid gap-10 lg:grid-cols-12" aria-label={site.results_latest ?? undefined}>
                                    <div className="lg:col-span-4" data-reveal="left">
                                        {site.results_latest && <p className="eyebrow">{site.results_latest}</p>}
                                        <p className="mt-3 font-serif text-[5.5rem] font-semibold leading-none text-navy-900">{latest.year}</p>
                                        <p className="mt-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-crest-700">{examLabel(latest.exam)}</p>
                                        {latest.rank_note && <p className="mt-6 font-serif text-xl italic text-slate-700">{latest.rank_note}</p>}
                                        {latest.notes && <p className="mt-4 leading-relaxed text-slate-600">{latest.notes}</p>}
                                    </div>
                                    <dl className="grid grid-cols-2 gap-4 lg:col-span-8" data-reveal-group data-reveal-step="110">
                                        <Tile label={site.results_candidates ?? ''}><CountUp value={String(latest.candidates)} /></Tile>
                                        <Tile label={site.results_pass_rate ?? ''}><CountUp value={fmtPct(passRate(latest))} /></Tile>
                                        <Tile label={`${site.results_division} I`}><CountUp value={String(latest.div_1)} /></Tile>
                                        <Tile label={site.results_gpa ?? ''}>{latest.gpa || '—'}</Tile>
                                    </dl>
                                </section>
                            )}

                            {rows.length > 0 && (
                                <section key={`chart-${exam}`} className="mt-20 border border-rule bg-white p-6 sm:p-10" data-reveal>
                                    <DivisionChart rows={rows} />
                                </section>
                            )}

                            {/* Table view: every figure, readable without the chart */}
                            <section key={`table-${exam}`} className="mt-16" data-reveal>
                                {site.results_table_title && <SectionHeading title={site.results_table_title} />}
                                <div className="mt-8 overflow-x-auto border border-rule bg-white">
                                    <table className="w-full min-w-[40rem] text-left text-[15px]">
                                        <thead className="border-b border-rule bg-paper text-[11px] uppercase tracking-[0.18em] text-slate-500">
                                            <tr>
                                                <th className="px-4 py-3 font-semibold">{site.results_year}</th>
                                                <th className="px-4 py-3 text-right font-semibold">{site.results_candidates}</th>
                                                {DIVS.map((d) => <th key={d.key} className="px-4 py-3 text-right font-semibold">{d.name === '0' ? site.results_div0 : `${site.results_division} ${d.name}`}</th>)}
                                                <th className="px-4 py-3 text-right font-semibold">{site.results_pass_rate}</th>
                                                <th className="px-4 py-3 text-right font-semibold">{site.results_gpa}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-rule tabular-nums">
                                            {rows.map((r) => (
                                                <tr key={r.id} className="hover:bg-crest-50">
                                                    <td className="px-4 py-3 font-serif text-lg font-semibold text-navy-900">{r.year}</td>
                                                    <td className="px-4 py-3 text-right">{r.candidates.toLocaleString()}</td>
                                                    {DIVS.map((d) => <td key={d.key} className="px-4 py-3 text-right">{r[d.key].toLocaleString()}</td>)}
                                                    <td className="px-4 py-3 text-right font-semibold text-navy-900">{fmtPct(passRate(r))}</td>
                                                    <td className="px-4 py-3 text-right">{r.gpa || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {site.results_note && <p className="mt-4 text-[14px] text-slate-500">{site.results_note}</p>}
                                {site.results_link && site.results_link_label && (
                                    <a href={site.results_link} target="_blank" rel="noreferrer" className="btn-outline mt-8">{site.results_link_label} ↗</a>
                                )}
                            </section>
                        </>
                    )}
                </div>
            </div>
        </SiteLayout>
    );
}
