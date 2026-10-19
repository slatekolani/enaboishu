import Swal, { type SweetAlertIcon } from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import type { SharedProps } from '@/types/cms';

/**
 * One place for every pop-up on the site (SweetAlert2), styled to match the school design
 * (see ".ens-swal" in app.css). Public pop-ups use the wording from Site settings → Pop-up messages,
 * so they appear in Kiswahili for visitors using the Kiswahili site.
 */

const base = {
    buttonsStyling: false,
    customClass: {
        popup: 'ens-swal',
        title: 'ens-swal-title',
        htmlContainer: 'ens-swal-text',
        confirmButton: 'ens-swal-confirm',
        cancelButton: 'ens-swal-cancel',
        actions: 'ens-swal-actions',
    },
    showClass: { popup: 'ens-swal-in' },
    hideClass: { popup: 'ens-swal-out' },
};

/** Small message in the corner that disappears by itself. */
export function toast(icon: SweetAlertIcon, title: string) {
    return Swal.fire({
        ...base,
        customClass: { popup: 'ens-swal ens-swal-toast', title: 'ens-swal-toast-title' },
        toast: true,
        position: 'top-end',
        icon,
        title,
        showConfirmButton: false,
        showCloseButton: true,
        timer: icon === 'error' ? 6000 : 3500,
        timerProgressBar: true,
    });
}

/** A centred message with one button. */
export function notify(icon: SweetAlertIcon, title: string, text?: string | null, button = 'OK') {
    return Swal.fire({ ...base, icon, title, text: text ?? undefined, confirmButtonText: button });
}

/** "Are you sure?" before anything that cannot be undone. Resolves to true when confirmed. */
export async function confirmDanger(opts: { title: string; text?: string; confirm?: string; cancel?: string }) {
    const result = await Swal.fire({
        ...base,
        customClass: { ...base.customClass, confirmButton: 'ens-swal-danger' },
        icon: 'warning',
        title: opts.title,
        text: opts.text ?? 'This cannot be undone.',
        showCancelButton: true,
        confirmButtonText: opts.confirm ?? 'Yes, delete',
        cancelButtonText: opts.cancel ?? 'Cancel',
        reverseButtons: true,
        focusCancel: true,
    });
    return result.isConfirmed;
}

/** A neutral "Are you sure?" (no danger colour), e.g. before logging out. */
export async function confirmAction(title: string, confirm = 'Yes', cancel = 'Cancel', text?: string) {
    const result = await Swal.fire({ ...base, icon: 'question', title, text, showCancelButton: true, confirmButtonText: confirm, cancelButtonText: cancel, reverseButtons: true });
    return result.isConfirmed;
}

/**
 * Shows the server's flash message after every visit:
 * - "toast": a corner message (admin panel)
 * - "dialog": a centred thank-you pop-up (public website)
 */
export function useFlashAlerts(mode: 'toast' | 'dialog') {
    const page = usePage<SharedProps & Record<string, unknown>>();
    const { flash, site } = page.props;

    useEffect(() => {
        if (flash?.success) {
            mode === 'toast' ? toast('success', flash.success) : notify('success', site.alert_thanks ?? 'Thank you', flash.success, site.alert_ok ?? 'OK');
        } else if (flash?.error) {
            mode === 'toast' ? toast('error', flash.error) : notify('error', site.alert_error_title ?? 'Something went wrong', flash.error, site.alert_ok ?? 'OK');
        }
        // A new page object arrives with every visit, so each flash is shown exactly once.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);
}
