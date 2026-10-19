import { ReactNode, useEffect } from 'react';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { toHtml } from '@/lib/site';
import { cn } from '@/lib/utils';

function Btn({ on, active, label, children }: { on: () => void; active?: boolean; label: string; children: ReactNode }) {
    return (
        <button
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={active}
            onMouseDown={(e) => e.preventDefault()}
            onClick={on}
            className={cn('flex h-8 min-w-8 items-center justify-center px-2 text-[13px] text-slate-700 hover:bg-slate-200', active && 'bg-navy-900 text-white hover:bg-navy-800')}
        >
            {children}
        </button>
    );
}

const Sep = () => <span className="mx-1 h-5 w-px bg-slate-300" />;

const icon = (d: string) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>
);

function Toolbar({ editor }: { editor: Editor }) {
    const c = () => editor.chain().focus();
    const setLink = () => {
        const previous = editor.getAttributes('link').href as string | undefined;
        const url = window.prompt('Link address (leave empty to remove the link)', previous ?? 'https://');
        if (url === null) return;
        if (url.trim() === '' || url === 'https://') c().extendMarkRange('link').unsetLink().run();
        else c().extendMarkRange('link').setLink({ href: url.trim() }).run();
    };

    return (
        <div className="sticky top-[57px] z-10 flex flex-wrap items-center gap-0.5 border-b border-slate-300 bg-slate-50 px-1.5 py-1">
            <select
                aria-label="Text style"
                className="h-8 border-slate-300 py-0 pl-2 pr-7 text-[13px]"
                value={editor.isActive('heading', { level: 2 }) ? 'h2' : editor.isActive('heading', { level: 3 }) ? 'h3' : 'p'}
                onChange={(e) => {
                    const v = e.target.value;
                    if (v === 'p') c().setParagraph().run();
                    else c().toggleHeading({ level: v === 'h2' ? 2 : 3 }).run();
                }}
            >
                <option value="p">Paragraph</option>
                <option value="h2">Heading</option>
                <option value="h3">Sub-heading</option>
            </select>
            <Sep />
            <Btn label="Bold" on={() => c().toggleBold().run()} active={editor.isActive('bold')}><b className="font-bold">B</b></Btn>
            <Btn label="Italic" on={() => c().toggleItalic().run()} active={editor.isActive('italic')}><i className="font-serif text-[15px]">I</i></Btn>
            <Btn label="Underline" on={() => c().toggleUnderline().run()} active={editor.isActive('underline')}><span className="underline">U</span></Btn>
            <Btn label="Strikethrough" on={() => c().toggleStrike().run()} active={editor.isActive('strike')}><span className="line-through">S</span></Btn>
            <Sep />
            <Btn label="Bulleted list" on={() => c().toggleBulletList().run()} active={editor.isActive('bulletList')}>{icon('M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01')}</Btn>
            <Btn label="Numbered list" on={() => c().toggleOrderedList().run()} active={editor.isActive('orderedList')}>{icon('M10 6h10M10 12h10M10 18h10M4 4v4M3 18h3l-3 3h3')}</Btn>
            <Btn label="Quote" on={() => c().toggleBlockquote().run()} active={editor.isActive('blockquote')}>{icon('M7 7h4v4H7zM7 11c0 3-1 5-3 6M15 7h4v4h-4zM15 11c0 3-1 5-3 6')}</Btn>
            <Btn label="Link" on={setLink} active={editor.isActive('link')}>{icon('M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1')}</Btn>
            <Btn label="Divider line" on={() => c().setHorizontalRule().run()}>{icon('M4 12h16')}</Btn>
            <Sep />
            <Btn label="Clear formatting" on={() => c().unsetAllMarks().clearNodes().run()}>{icon('M6 5h12M12 5l-3 14M4 20l16-16')}</Btn>
            <Btn label="Undo" on={() => c().undo().run()}>{icon('M9 14L4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3')}</Btn>
            <Btn label="Redo" on={() => c().redo().run()}>{icon('M15 14l5-5-5-5M20 9H9a5 5 0 0 0 0 10h3')}</Btn>
        </div>
    );
}

/** Word-processor style editor. Saves HTML, which the server cleans before storing. */
export default function RichEditor({ id, value, onChange }: { id: string; value: string; onChange: (html: string) => void }) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({ heading: { levels: [2, 3] }, code: false, codeBlock: false }),
            Underline,
            Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener', target: '_blank' } }),
            Placeholder.configure({ placeholder: 'Start writing…' }),
        ],
        content: toHtml(value),
        editorProps: { attributes: { id, class: 'rich min-h-[14rem] px-5 py-4 focus:outline-none' } },
        onUpdate: ({ editor }) => onChange(editor.isEmpty ? '' : editor.getHTML()),
    });

    useEffect(() => () => editor?.destroy(), [editor]);

    return (
        <div className="border border-slate-300 bg-white focus-within:border-navy-800 focus-within:ring-1 focus-within:ring-navy-800">
            {editor && <Toolbar editor={editor} />}
            <EditorContent editor={editor} />
        </div>
    );
}
