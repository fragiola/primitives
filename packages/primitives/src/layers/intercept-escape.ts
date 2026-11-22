/**
 * Calls `onEscape` on Escape before the document's overlay layers see the key, and consumes it
 * (spec/tooltip.md: "Escape closes it and stops there"). It listens in the capture phase of the
 * document's window, which runs before the layer stack's listener on the document; the key is
 * then prevented and stopped, and the stack ignores a prevented key, so an enclosing dialog,
 * popover or menu stays open. `when` limits it to some keys (a RangeCalendar takes only the
 * Escape pressed inside its grid, spec/calendar.md); the others go on to the layers. Returns the
 * cleanup.
 */
export function interceptEscape(
    doc: Document,
    onEscape: (event: KeyboardEvent) => void,
    options: { when?: (event: KeyboardEvent) => boolean } = {},
): () => void {
    const target: Document | Window = doc.defaultView ?? doc;
    const onKeyDown = (event: Event) => {
        if (
            !(event instanceof KeyboardEvent) ||
            event.key !== "Escape" ||
            event.defaultPrevented ||
            (options.when !== undefined && !options.when(event))
        ) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        onEscape(event);
    };
    target.addEventListener("keydown", onKeyDown, true);
    return () => target.removeEventListener("keydown", onKeyDown, true);
}
