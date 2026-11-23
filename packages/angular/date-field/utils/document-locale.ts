/**
 * The document's `lang`, then the browser's language (spec/date-field.md, "API", the calendars'
 * rule). A server render has a document (Angular's) but no browser: there it falls back to
 * `en-US`, never the server's own language (Epic #22). The calendars keep their own copy, so their
 * entries are unchanged.
 */
export function documentLocale(doc: Document, browser: boolean): string {
    if (doc.documentElement.lang) {
        return doc.documentElement.lang;
    }
    return browser && typeof navigator !== "undefined"
        ? navigator.language
        : "en-US";
}
