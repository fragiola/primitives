import { watchDocumentLanguage } from "@fragiola/primitives/date";
import { onBeforeUnmount, onMounted, shallowRef } from "vue";

/** The locale of the first render with no `locale`: a server knows neither of the others. */
const FIRST_RENDER_LOCALE = "en-US";

function documentLocale(): string {
    if (typeof document !== "undefined" && document.documentElement.lang) {
        return document.documentElement.lang;
    }
    return typeof navigator !== "undefined"
        ? navigator.language
        : FIRST_RENDER_LOCALE;
}

/**
 * A month or year calendar's locale (spec/month-calendar.md, "API"): its own, else the document's `lang`,
 * else the browser's language, read once mounted: a server render and its hydration use `en-US`,
 * and a later change of `<html lang>` is followed (the calendars' rule, spec/calendar.md "API").
 * A copy of the calendar's, so its entries are unchanged.
 */
export function useDocumentLocale(
    locale: () => string | undefined,
): () => string {
    const mounted = shallowRef<string>();
    let stop = () => {};
    onMounted(() => {
        mounted.value = documentLocale();
        stop = watchDocumentLanguage(document, () => {
            mounted.value = documentLocale();
        });
    });
    onBeforeUnmount(() => stop());
    return () => locale() ?? mounted.value ?? FIRST_RENDER_LOCALE;
}
