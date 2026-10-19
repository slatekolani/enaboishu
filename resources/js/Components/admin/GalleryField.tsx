import { useEffect, useMemo, useState } from 'react';
import { useMedia } from '@/lib/site';

interface Props {
    id: string;
    keep: string[];
    added: File[];
    onKeep: (paths: string[]) => void;
    onAdd: (files: File[]) => void;
}

/** Many photos at once: existing photos can be removed, new ones previewed before saving. */
export default function GalleryField({ id, keep, added, onKeep, onAdd }: Props) {
    const media = useMedia();
    const [dragging, setDragging] = useState(false);
    const previews = useMemo(() => added.map((f) => URL.createObjectURL(f)), [added]);
    useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

    const addFiles = (list: FileList | null) => {
        const images = Array.from(list ?? []).filter((f) => f.type.startsWith('image/'));
        if (images.length) onAdd([...added, ...images]);
    };

    const tile = 'group relative aspect-square overflow-hidden border border-slate-300 bg-slate-100';
    const removeBtn = 'absolute right-1 top-1 bg-white/95 px-2 py-0.5 text-xs font-semibold text-red-700 shadow hover:bg-red-700 hover:text-white';

    return (
        <div>
            <label
                htmlFor={id}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
                className={`flex cursor-pointer flex-col items-center justify-center border-2 border-dashed px-6 py-8 text-center transition-colors ${dragging ? 'border-navy-800 bg-crest-50' : 'border-slate-300 bg-white hover:border-navy-800'}`}
            >
                <span className="text-[15px] font-semibold text-navy-900">Choose photos or drag them here</span>
                <span className="mt-1 text-[13px] text-slate-500">You can select many at once. JPG, PNG, WebP or GIF, up to 8 MB each.</span>
                <input id={id} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
            </label>

            {(keep.length > 0 || added.length > 0) && (
                <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
                    {keep.map((p) => (
                        <div key={p} className={tile}>
                            <img src={media(p) ?? ''} alt="" className="h-full w-full object-cover" />
                            <button type="button" className={removeBtn} onClick={() => onKeep(keep.filter((k) => k !== p))}>Remove</button>
                        </div>
                    ))}
                    {added.map((f, i) => (
                        <div key={`${f.name}-${i}`} className={`${tile} ring-2 ring-crest-400`}>
                            <img src={previews[i]} alt="" className="h-full w-full object-cover" />
                            <span className="absolute bottom-1 left-1 bg-crest-600 px-1.5 text-[11px] font-semibold text-white">New</span>
                            <button type="button" className={removeBtn} onClick={() => onAdd(added.filter((_, j) => j !== i))}>Remove</button>
                        </div>
                    ))}
                </div>
            )}
            <p className="mt-2 text-[13px] text-slate-500">
                {keep.length + added.length} photo{keep.length + added.length === 1 ? '' : 's'}
                {added.length > 0 && ` · ${added.length} new, uploaded when you save`}
            </p>
        </div>
    );
}
