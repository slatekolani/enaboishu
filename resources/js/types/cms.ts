export type Settings = Record<string, string | null>;

export interface Slide { id: number; eyebrow: string | null; title: string; subtitle: string | null; image: string | null; layout: string; image_caption: string | null; button_label: string | null; button_url: string | null; button2_label: string | null; button2_url: string | null }
export interface Stat { id: number; label: string; value: string }
export interface Program { id: number; title: string; level: string; summary: string | null; subjects: string | null; image: string | null }
export interface Facility { id: number; title: string; description: string | null; image: string | null }
export interface CoreValue { id: number; title: string; description: string | null }
export interface Staff { id: number; name: string; position: string; department: string; academic_department: string | null; subjects: string | null; class_assigned: string | null; bio: string | null; photo: string | null }
export interface Post { id: number; title: string; slug: string; excerpt: string | null; body?: string | null; image: string | null; photos?: string[] | null; published_at: string }
export interface Article extends Post { author: string | null; category: string | null }
export interface SchoolEvent { id: number; title: string; slug: string | null; starts_at: string; ends_at: string | null; time: string | null; location: string | null; summary: string | null; description?: string | null; image?: string | null; photos?: string[] | null }
export interface GalleryItem { id: number; caption: string | null; category: string; image: string }
export interface Testimonial { id: number; name: string; role: string | null; quote: string; photo: string | null }
export interface DownloadItem { id: number; title: string; category: string; form_level: string; description: string | null; file: string; file_size: number | null; file_type: string | null; downloads_count: number }
export interface Notice { id: number; message: string; tone: 'Information' | 'Important' | 'Urgent'; link_label: string | null; link_url: string | null; updated_at: string }
export interface ExamResult { id: number; year: number; exam: 'CSEE' | 'FTNA' | 'ACSEE'; candidates: number; div_1: number; div_2: number; div_3: number; div_4: number; div_0: number; gpa: string | null; rank_note: string | null; notes: string | null }

export interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
}

export type SharedProps = {
    auth: { user: { id: number; name: string; email: string } | null; isAdmin: boolean };
    flash: { success?: string | null; error?: string | null };
    mediaBase: string;
    crest: string;
    locale: 'en' | 'sw';
    notices: Notice[];
    menuPages: { id: number; title: string; slug: string; menu_group: string }[];
    site: Settings;
    unreadMessages: number;
    newEnquiries: number;
    seo?: { title: string; description: string };
};

export interface CustomPage { id: number; title: string; slug: string; menu_group: string; intro: string | null; image: string | null; body: string | null; photos: string[] | null }
