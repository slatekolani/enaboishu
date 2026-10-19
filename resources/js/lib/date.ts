/**
 * Dates in the visitor's language. Supports the patterns the site uses:
 * d, EEEE, MMM, MMMM, yyyy (any combination with spaces, commas and dashes).
 */
const NAMES = {
    en: {
        months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    sw: {
        months: ['Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni', 'Julai', 'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba'],
        days: ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi'],
    },
} as const;

let current: keyof typeof NAMES = 'en';

export function setDateLocale(locale: string) {
    current = locale === 'sw' ? 'sw' : 'en';
}

export function formatDate(value: string | Date, pattern = 'd MMMM yyyy') {
    const date = typeof value === 'string' ? new Date(`${value.slice(0, 10)}T12:00:00`) : value;
    const n = NAMES[current];
    return pattern.replace(/EEEE|MMMM|MMM|yyyy|d/g, (token) => {
        switch (token) {
            case 'EEEE': return n.days[date.getDay()];
            case 'MMMM': return n.months[date.getMonth()];
            case 'MMM': return n.months[date.getMonth()].slice(0, 3);
            case 'yyyy': return String(date.getFullYear());
            default: return String(date.getDate());
        }
    });
}
