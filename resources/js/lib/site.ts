import { usePage } from '@inertiajs/react';
import type { SharedProps } from '@/types/cms';

/** Site-wide settings edited in Admin → Site settings. */
export function useSite() {
    return usePage<SharedProps & Record<string, unknown>>().props.site;
}

/** Turns a stored upload path into a public URL. */
export function useMedia() {
    const base = usePage<SharedProps & Record<string, unknown>>().props.mediaBase;
    return (path?: string | null) => (path ? `${base}/${path}` : null);
}

/** Splits a multi-line setting into trimmed, non-empty lines. */
export const lines = (value?: string | null): string[] =>
    (value ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

/** Splits text into paragraphs separated by blank lines. */
export const paragraphs = (value?: string | null): string[] =>
    (value ?? '').split(/\r?\n\s*\r?\n/).map((p) => p.trim()).filter(Boolean);

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Does this look like HTML from the formatting editor (rather than older plain text)? */
export const isHtml = (value?: string | null) => /<\/?(p|h[1-6]|ul|ol|li|strong|em|b|i|u|s|br|blockquote|a)\b/i.test(value ?? '');

/**
 * Text from the CMS as HTML. Editor content is already cleaned on the server;
 * plain text (older entries, built-in defaults) is escaped and split into paragraphs.
 */
export function toHtml(value?: string | null): string {
    if (!value) return '';
    if (isHtml(value)) return value;
    return paragraphs(value)
        .map((p) => (p.startsWith('## ') ? `<h3>${escapeHtml(p.slice(3))}</h3>` : `<p>${escapeHtml(p).replace(/\r?\n/g, '<br>')}</p>`))
        .join('');
}

/** Plain words from CMS text, without any formatting tags. */
export const plainText = (value?: string | null) =>
    (value ?? '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

export const readingMinutes = (value?: string | null) => Math.max(1, Math.round(plainText(value).split(' ').filter(Boolean).length / 200));
