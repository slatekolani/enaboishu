import { router } from '@inertiajs/react';
import { confirmDanger } from '@/lib/alerts';
import AdminLayout from '@/Layouts/AdminLayout';

interface Msg { id: number; name: string; email: string; phone: string | null; subject: string | null; body: string; created_at: string; read_at: string | null }

export default function Messages({ messages }: { messages: Msg[] }) {
    return (
        <AdminLayout title="Messages">
            {messages.length === 0 && <p className="border border-slate-200 bg-white p-8 text-center text-slate-500">No messages yet. Messages sent through the website contact form appear here.</p>}
            <div className="space-y-4">
                {messages.map((m) => (
                    <article key={m.id} className={`border bg-white p-5 ${m.read_at ? 'border-slate-200' : 'border-brass'}`}>
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <h2 className="font-sans text-base font-semibold text-slate-900">{m.subject || 'No subject'}</h2>
                            <time className="text-sm text-slate-400">{m.created_at.slice(0, 10)}</time>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">
                            {m.name} · <a href={`mailto:${m.email}`} className="text-navy-800 hover:underline">{m.email}</a>{m.phone ? ` · ${m.phone}` : ''}
                        </p>
                        <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-slate-800">{m.body}</p>
                        <div className="mt-4 flex gap-4 text-sm">
                            {!m.read_at && <button onClick={() => router.patch(route('admin.messages.read', m.id), {}, { preserveScroll: true })} className="font-medium text-navy-800 hover:underline">Mark as read</button>}
                            <button onClick={async () => (await confirmDanger({ title: 'Delete this message?', text: `The message from ${m.name} will be deleted permanently.` })) && router.delete(route('admin.messages.destroy', m.id), { preserveScroll: true })} className="text-red-700 hover:underline">Delete</button>
                        </div>
                    </article>
                ))}
            </div>
        </AdminLayout>
    );
}
