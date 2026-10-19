import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useMedia } from '@/lib/site';
import { confirmDanger } from '@/lib/alerts';
import type { FieldDef } from '@/Components/admin/Field';

export interface Resource {
    key: string;
    label: string;
    singular: string;
    description: string | null;
    columns: [string, string, string?][];
    fields: FieldDef[];
}

export default function Index({ resource, rows }: { resource: Resource; rows: Record<string, any>[] }) {
    const media = useMedia();

    const cell = (row: Record<string, any>, [name, , type]: [string, string, string?]) => {
        const v = row[name];
        if (type === 'image') return v ? <img src={media(v) ?? ''} alt="" className="h-12 w-16 object-cover" /> : <span className="flex h-12 w-16 items-center justify-center bg-slate-100 text-xs text-slate-400">none</span>;
        if (type === 'bool') return <span className={v ? 'font-medium text-green-700' : 'text-slate-400'}>{v ? 'Yes' : 'Hidden'}</span>;
        if (type === 'date') return v ? String(v).slice(0, 10) : '—';
        if (type === 'count') return Array.isArray(v) && v.length ? `${v.length}` : '—';
        return v ?? '—';
    };

    const remove = async (row: Record<string, any>) => {
        const name = row.title ?? row.name ?? row.message ?? row.caption ?? row.label ?? `this ${resource.singular}`;
        if (await confirmDanger({ title: `Delete ${resource.singular}?`, text: `“${String(name).slice(0, 80)}” will be removed from the website, including its photos. This cannot be undone.` })) {
            router.delete(route('admin.resource.destroy', [resource.key, row.id]), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout
            title={resource.label}
            actions={<Link href={route('admin.resource.create', resource.key)} className="btn-primary !py-2">Add {resource.singular}</Link>}
        >
            {resource.description && <p className="-mt-2 mb-6 text-slate-600">{resource.description}</p>}
            <div className="overflow-x-auto border border-slate-200 bg-white">
                <table className="w-full text-left text-[15px]">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                        <tr>
                            {resource.columns.map((c) => <th key={c[0]} className="px-4 py-3 font-semibold">{c[1]}</th>)}
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {rows.length === 0 && (
                            <tr><td colSpan={resource.columns.length + 1} className="px-4 py-10 text-center text-slate-500">Nothing here yet. Use “Add {resource.singular}” to create the first one.</td></tr>
                        )}
                        {rows.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50">
                                {resource.columns.map((c) => <td key={c[0]} className="px-4 py-3 align-middle">{cell(row, c)}</td>)}
                                <td className="whitespace-nowrap px-4 py-3 text-right">
                                    <Link href={route('admin.resource.edit', [resource.key, row.id])} className="font-medium text-navy-800 hover:underline">Edit</Link>
                                    <button onClick={() => remove(row)} className="ml-4 text-red-700 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
