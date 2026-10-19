import { useMedia } from '@/lib/site';
import RichEditor from './RichEditor';

export interface FieldDef {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'longtext' | 'richtext' | 'gallery' | 'image' | 'file' | 'date' | 'number' | 'select' | 'boolean' | 'url';
    help?: string;
    options?: string[];
    required?: boolean;
    default?: string | number | boolean | null;
    translate?: boolean;
}

const base = 'w-full border-slate-300 bg-white px-3 py-2 text-[15px] focus:border-navy-800 focus:ring-navy-800';

interface Props {
    field: FieldDef;
    value: unknown;
    error?: string;
    existing?: string | null; // stored path for image / file
    removed?: boolean;
    onChange: (value: unknown) => void;
    onRemove?: (removed: boolean) => void;
}

export default function Field({ field, value, error, existing, removed, onChange, onRemove }: Props) {
    const media = useMedia();
    const id = `f-${field.name}`;
    const str = (value ?? '') as string;

    let control;
    switch (field.type) {
        case 'textarea':
            control = <textarea id={id} rows={3} value={str} onChange={(e) => onChange(e.target.value)} className={base} />;
            break;
        case 'longtext':
            control = <textarea id={id} rows={10} value={str} onChange={(e) => onChange(e.target.value)} className={base} />;
            break;
        case 'richtext':
            control = <RichEditor id={id} value={str} onChange={(html) => onChange(html)} />;
            break;
        case 'date':
            control = <input id={id} type="date" value={str.slice(0, 10)} onChange={(e) => onChange(e.target.value)} className={base + ' sm:max-w-xs'} />;
            break;
        case 'number':
            control = <input id={id} type="number" min={0} value={str} onChange={(e) => onChange(e.target.value)} className={base + ' sm:max-w-[10rem]'} />;
            break;
        case 'url':
            control = <input id={id} type="url" value={str} onChange={(e) => onChange(e.target.value)} className={base} placeholder="https://" />;
            break;
        case 'select':
            control = (
                <select id={id} value={str} onChange={(e) => onChange(e.target.value)} className={base + ' sm:max-w-md'}>
                    {field.options?.map((o) => <option key={o}>{o}</option>)}
                </select>
            );
            break;
        case 'boolean':
            return (
                <div>
                    <label className="flex items-center gap-3">
                        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 border-slate-400 text-navy-800 focus:ring-navy-800" />
                        <span className="text-[15px] font-medium text-slate-800">{field.label}</span>
                    </label>
                </div>
            );
        case 'image':
        case 'file': {
            const isImage = field.type === 'image';
            const file = value instanceof File ? value : null;
            const preview = file && isImage ? URL.createObjectURL(file) : !removed ? media(existing) : null;
            control = (
                <div className="flex flex-wrap items-start gap-4">
                    {isImage && preview && <img src={preview} alt="" className="h-24 w-36 border border-slate-300 object-cover" />}
                    <div className="space-y-2">
                        <input
                            id={id}
                            type="file"
                            accept={isImage ? 'image/jpeg,image/png,image/webp,image/gif' : '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx'}
                            onChange={(e) => { onChange(e.target.files?.[0] ?? null); onRemove?.(false); }}
                            className="block text-sm file:mr-3 file:border file:border-slate-300 file:bg-white file:px-3 file:py-1.5 file:text-sm hover:file:bg-slate-50"
                        />
                        {!isImage && existing && !file && <p className="text-sm text-slate-500">Current file: {existing.split('/').pop()}</p>}
                        {existing && !file && !field.required && (
                            <label className="flex items-center gap-2 text-sm text-slate-600">
                                <input type="checkbox" checked={!!removed} onChange={(e) => onRemove?.(e.target.checked)} /> Remove current {isImage ? 'image' : 'file'}
                            </label>
                        )}
                    </div>
                </div>
            );
            break;
        }
        default:
            control = <input id={id} type="text" value={str} onChange={(e) => onChange(e.target.value)} className={base} />;
    }

    return (
        <div>
            <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-800">{field.label}</label>
            {control}
            {field.help && <p className="mt-1.5 text-[13px] text-slate-500">{field.help}</p>}
            {error && <p className="mt-1.5 text-sm text-red-700">{error}</p>}
        </div>
    );
}
