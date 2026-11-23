import {
    ClipboardIndicator,
    ClipboardInput,
    ClipboardRoot,
    ClipboardTrigger,
} from "@fragiola/primitives-angular/clipboard";
import { clipboard } from "examples-shared/recipes/clipboard";

/** Every Clipboard directive, for a scenario's `imports`. */
export const CLIPBOARD_PARTS = [
    ClipboardRoot,
    ClipboardTrigger,
    ClipboardIndicator,
    ClipboardInput,
] as const;

const ICON = `viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"`;

/** The styled Trigger, holding the Indicator with its copy, check and cross icons (React's kit). */
export function clipboardTrigger(label: string): string {
    return `<button clipboardTrigger aria-label="${label}" class="${clipboard.trigger}"><span clipboardIndicator class="${clipboard.indicator}"><svg class="${clipboard.copy}" ${ICON}><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg><svg class="${clipboard.check}" ${ICON}><path d="M5 12l5 5L20 7" /></svg><svg class="${clipboard.failed}" ${ICON}><path d="M6 6l12 12M18 6L6 18" /></svg></span></button>`;
}
