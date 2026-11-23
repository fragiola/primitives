import { watchDocumentLanguage } from "@fragiola/primitives/date";
import { useSyncExternalStore } from "react";

/** The locale of the first render with no `locale`: a server knows neither of the others. */
const FIRST_RENDER_LOCALE = "en-US";
const serverLocale = () => FIRST_RENDER_LOCALE;
// a change of the document's `lang` renders again (followed after mount, as the calendars)
const subscribeLanguage = (change: () => void) =>
    watchDocumentLanguage(document, change);

function documentLocale(): string {
    if (typeof document !== "undefined" && document.documentElement.lang) {
        return document.documentElement.lang;
    }
    return typeof navigator !== "undefined"
        ? navigator.language
        : FIRST_RENDER_LOCALE;
}

/**
 * A date or time field's locale (spec/date-field.md, "API"): its own, else the document's `lang`,
 * else the browser's language; a server render and its hydration use `en-US`, and React renders
 * again with the document's right after (the calendars' rule, spec/calendar.md "API"). The
 * calendars keep their own copy, so their entries are unchanged.
 */
export function useDocumentLocale(locale: string | undefined): string {
    const fallback = useSyncExternalStore(
        subscribeLanguage,
        documentLocale,
        serverLocale,
    );
    return locale ?? fallback;
}
