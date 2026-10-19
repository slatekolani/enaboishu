import { FormEvent, useEffect, useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { confirmDanger, toast } from '@/lib/alerts';

interface U { id: number; name: string; email: string; role: 'admin' | 'editor' | null; created_at: string | null; is_me: boolean }

const input = 'w-full border-slate-300 text-[15px] focus:border-navy-800 focus:ring-navy-800';

function UserForm({ user, onDone }: { user?: U; onDone: () => void }) {
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name: user?.name ?? '', email: user?.email ?? '', role: user?.role ?? 'editor', password: '', password_confirmation: '',
    });
    const submit = (e: FormEvent) => {
        e.preventDefault();
        const opts = { preserveScroll: true, onSuccess: () => { reset(); onDone(); }, onError: () => toast('error', 'Please fix the highlighted fields.') };
        user ? patch(route('admin.users.update', user.id), opts) : post(route('admin.users.store'), opts);
    };
    const err = (k: keyof typeof errors) => errors[k] && <p className="mt-1 text-sm text-red-700">{errors[k]}</p>;

    return (
        <form onSubmit={submit} className="grid gap-4 border border-slate-200 bg-white p-6 sm:grid-cols-2">
            <div><label className="mb-1 block text-sm font-semibold">Full name</label><input className={input} value={data.name} onChange={(e) => setData('name', e.target.value)} required />{err('name')}</div>
            <div><label className="mb-1 block text-sm font-semibold">Email (used to sign in)</label><input type="email" className={input} value={data.email} onChange={(e) => setData('email', e.target.value)} required />{err('email')}</div>
            <div className="sm:col-span-2">
                <span className="mb-1 block text-sm font-semibold">Role</span>
                <div className="grid gap-3 sm:grid-cols-2">
                    {([
                        ['editor', 'Editor', 'Posts news, articles, events, notices, photos, downloads, clubs and student leaders. Cannot change site settings, see messages, enquiries or alumni details, or manage accounts.'],
                        ['admin', 'Administrator', 'Everything, including site settings, the inbox, alumni, user accounts and the change history.'],
                    ] as const).map(([value, title, text]) => (
                        <label key={value} className={`flex cursor-pointer gap-3 border p-4 ${data.role === value ? 'border-navy-900 bg-crest-50' : 'border-slate-300'}`}>
                            <input type="radio" name="role" value={value} checked={data.role === value} onChange={() => setData('role', value)} className="mt-1 text-navy-900 focus:ring-navy-900" />
                            <span><span className="block font-semibold text-slate-900">{title}</span><span className="text-sm text-slate-600">{text}</span></span>
                        </label>
                    ))}
                </div>
                {err('role')}
            </div>
            <div><label className="mb-1 block text-sm font-semibold">{user ? 'New password (leave empty to keep)' : 'Password (at least 10 characters)'}</label><input type="password" autoComplete="new-password" className={input} value={data.password} onChange={(e) => setData('password', e.target.value)} required={!user} />{err('password')}</div>
            <div><label className="mb-1 block text-sm font-semibold">Repeat password</label><input type="password" autoComplete="new-password" className={input} value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} required={!user} /></div>
            <div className="flex items-center gap-4 sm:col-span-2">
                <button disabled={processing} className="btn-primary !py-2.5 disabled:opacity-60">{user ? 'Save changes' : 'Create account'}</button>
                <button type="button" onClick={onDone} className="text-slate-600 hover:underline">Cancel</button>
            </div>
        </form>
    );
}

export default function Users({ users }: { users: U[] }) {
    const [editing, setEditing] = useState<number | 'new' | null>(null);
    const { errors } = usePage().props as unknown as { errors: Record<string, string> };
    useEffect(() => { if (errors.user) toast('error', errors.user); }, [errors.user]);

    return (
        <AdminLayout title="Users & roles" actions={editing !== 'new' && <button onClick={() => setEditing('new')} className="btn-primary !py-2">Add a user</button>}>
            <p className="-mt-2 mb-6 max-w-3xl text-slate-600">Give teachers and staff their own sign-in. Every change they make is recorded in the change history. Share passwords privately; users can change their own password under their name at the top right.</p>
            {editing === 'new' && <div className="mb-6"><UserForm onDone={() => setEditing(null)} /></div>}
            <div className="divide-y divide-slate-200 border border-slate-200 bg-white">
                {users.map((u) => (
                    <div key={u.id} className="px-5 py-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="font-semibold text-slate-900">{u.name} {u.is_me && <span className="text-sm font-normal text-slate-500">(you)</span>}</p>
                                <p className="text-sm text-slate-500">{u.email}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${u.role === 'admin' ? 'bg-navy-900 text-white' : u.role === 'editor' ? 'bg-crest-200 text-navy-950' : 'bg-slate-200 text-slate-600'}`}>{u.role ?? 'No access'}</span>
                                <button onClick={() => setEditing(editing === u.id ? null : u.id)} className="text-sm font-medium text-navy-800 hover:underline">Edit</button>
                                {!u.is_me && <button onClick={async () => (await confirmDanger({ title: `Delete ${u.name}'s account?`, text: 'They will no longer be able to sign in. Their past changes stay in the change history.', confirm: 'Yes, delete account' })) && router.delete(route('admin.users.destroy', u.id), { preserveScroll: true })} className="text-sm text-red-700 hover:underline">Delete</button>}
                            </div>
                        </div>
                        {editing === u.id && <div className="mt-4"><UserForm user={u} onDone={() => setEditing(null)} /></div>}
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
}
