/**
 * Calls `onChange` when the `lang` of `doc`'s document element changes (spec/calendar.md, "API":
 * a calendar with no `locale` follows the document's language after mount, Epic #49). Returns the
 * cleanup.
 */
export function watchDocumentLanguage(
    doc: Document,
    onChange: () => void,
): () => void {
    const Observer = doc.defaultView?.MutationObserver;
    if (Observer === undefined) {
        return () => {};
    }
    const observer = new Observer(() => onChange());
    observer.observe(doc.documentElement, {
        attributes: true,
        attributeFilter: ["lang"],
    });
    return () => observer.disconnect();
}
