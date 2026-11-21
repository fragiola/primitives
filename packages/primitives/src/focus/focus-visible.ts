/** Per document: whether its last input was a key (a document starts listening on first call). */
const keyboardInput = /* @__PURE__ */ new WeakMap<
    Document,
    { keyboard: boolean }
>();

/**
 * Whether the last focus in `doc` came from the keyboard (for overlays that highlight on keyboard
 * open only). Each document is tracked on its own (an iframe's, a test's), from its first call.
 */
export function isKeyboardModality(doc: Document): boolean {
    let state = keyboardInput.get(doc);
    if (state === undefined) {
        const tracked = { keyboard: false };
        state = tracked;
        keyboardInput.set(doc, tracked);
        doc.addEventListener(
            "keydown",
            () => {
                tracked.keyboard = true;
            },
            true,
        );
        doc.addEventListener(
            "pointerdown",
            () => {
                tracked.keyboard = false;
            },
            true,
        );
    }
    return state.keyboard;
}
