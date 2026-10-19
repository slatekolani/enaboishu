import { useId } from 'react';
import Logo from '@/Components/site/Logo';

/** A round seal: the crest inside a ring of text that turns slowly. */
export default function Seal({ text, className = 'h-32 w-32 sm:h-36 sm:w-36' }: { text: string; className?: string }) {
    const id = `seal-${useId().replace(/:/g, '')}`;
    return (
        <div className={`relative rounded-full bg-paper shadow-[0_18px_40px_-12px_rgba(0,0,0,0.5)] ${className}`}>
            <svg viewBox="0 0 100 100" className="spin-slow absolute inset-0 h-full w-full" aria-hidden>
                <defs>
                    <path id={id} d="M50 50m-38 0a38 38 0 1 1 76 0a38 38 0 1 1-76 0" />
                </defs>
                <text className="fill-navy-900" style={{ fontSize: 7.2, letterSpacing: 1.6, fontWeight: 600 }}>
                    <textPath href={`#${id}`} textLength="236">{text}</textPath>
                </text>
            </svg>
            <div className="absolute inset-[26%] flex items-center justify-center rounded-full border border-navy-900/15">
                <Logo className="h-[70%]" />
            </div>
        </div>
    );
}
