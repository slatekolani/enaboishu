import { toHtml } from '@/lib/site';

/**
 * Shows formatted text from the CMS editor as normal reading text (bold, italics,
 * headings, lists, quotes, links): never as raw tags. The HTML is cleaned on save.
 */
export default function RichText({ html, className = '' }: { html?: string | null; className?: string }) {
    const content = toHtml(html);
    if (!content) return null;
    return <div className={`rich ${className}`} dangerouslySetInnerHTML={{ __html: content }} />;
}
