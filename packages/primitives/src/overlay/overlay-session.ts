import { watchFocusOutside } from "../layers/focus-outside.ts";
import { pushLayer } from "../layers/layer-stack.ts";

/** How an overlay asks to be dismissed (spec/README.md, "Change details"). */
export type DismissReason = "escape-key" | "outside-press" | "focus-out";

type Elements = () => readonly (Element | null | undefined)[];

export interface OverlaySessionOptions {
    /** The overlay's own elements (its positioner or popup). */
    elements: Elements;
    /** Elements a press on does not dismiss it (its trigger, which toggles it itself). */
    ignore?: Elements;
    /** Called when Escape, an outside press or (with `focusOut`) focus leaving dismisses it. */
    dismiss: (reason: DismissReason) => void;
    /**
     * Non-modal overlays: dismiss when focus moves outside the overlay, its child layers and these
     * elements (usually the trigger).
     */
    focusOut?: Elements;
    /**
     * Where focus goes when the session ends: `to()` when `reason()` (the reason the overlay closed)
     * is one of `when` (or always, without `when`); nowhere otherwise. `to()` may return `false`
     * for "do not move focus".
     */
    returnFocus?: {
        when?: ReadonlySet<string>;
        /**
         * Reasons that return focus only once the press that dismissed the overlay has ended, and
         * only when it left focus nowhere (on the body): a press on a focusable element keeps the
         * focus it gave (spec/popover.md, "Focus": Base UI's focus after an outside press). A
         * getter is read when the session ends (a menu's `modal` may change while it is open).
         */
        whenUnfocused?:
            | ReadonlySet<string>
            | (() => ReadonlySet<string> | undefined);
        reason: () => string | null;
        to: () => HTMLElement | null | false;
    };
}

export interface OverlaySession {
    /** The elements of the layers opened after this one (its child layers). */
    elementsAbove: () => Element[];
    /** Ends the session: removes the layer and the focus watch, then returns focus if due. */
    end: () => void;
}

/**
 * The wiring every overlay repeats (docs/reports/checkpoint.md, boundary pressure 2): its layer
 * (Escape, outside presses), the non-modal focus-out watch, and the focus return by close reason.
 * It holds no component state: the framework passes what it knows through the callbacks.
 */
export function openOverlaySession(
    doc: Document,
    options: OverlaySessionOptions,
): OverlaySession {
    const view = doc.defaultView;
    // the outside press in progress, if any: its end runs `afterPress` (once focus has settled)
    let pressing = false;
    let afterPress: (() => void) | null = null;
    const onPressEnd = () => {
        doc.removeEventListener("pointerup", onPressEnd, true);
        doc.removeEventListener("pointercancel", onPressEnd, true);
        pressing = false;
        const pending = afterPress;
        afterPress = null;
        if (pending) {
            // a touch press focuses its target on the compatibility mousedown, after pointerup
            view?.setTimeout(pending, 0);
        }
    };
    const layer = pushLayer(doc, {
        elements: options.elements,
        ignore: options.ignore,
        onEscape: () => options.dismiss("escape-key"),
        onOutsidePress: () => {
            if (!pressing) {
                pressing = true;
                doc.addEventListener("pointerup", onPressEnd, true);
                doc.addEventListener("pointercancel", onPressEnd, true);
            }
            options.dismiss("outside-press");
        },
    });
    const focusOut = options.focusOut;
    const stopWatching = focusOut
        ? watchFocusOutside(
              doc,
              () => [
                  ...options.elements(),
                  ...focusOut(),
                  ...layer.elementsAbove(),
              ],
              () => {
                  // the outside press that already dismissed the overlay moved the focus
                  if (!pressing) {
                      options.dismiss("focus-out");
                  }
              },
          )
        : () => {};
    let ended = false;
    return {
        elementsAbove: () => layer.elementsAbove(),
        end() {
            if (ended) {
                return;
            }
            ended = true;
            layer.remove();
            stopWatching();
            const returnFocus = options.returnFocus;
            if (!returnFocus) {
                return;
            }
            const reason = returnFocus.reason() ?? "";
            const unfocused =
                typeof returnFocus.whenUnfocused === "function"
                    ? returnFocus.whenUnfocused()
                    : returnFocus.whenUnfocused;
            if (unfocused?.has(reason)) {
                const focusIfUnfocused = () => {
                    const active = doc.activeElement;
                    if (active === null || active === doc.body) {
                        const target = returnFocus.to();
                        if (target && target.isConnected === true) {
                            target.focus({ preventScroll: true });
                        }
                    }
                };
                if (pressing) {
                    afterPress = focusIfUnfocused;
                } else {
                    view?.setTimeout(focusIfUnfocused, 0);
                }
                return;
            }
            if (!returnFocus.when || returnFocus.when.has(reason)) {
                const target = returnFocus.to();
                if (target) {
                    target.focus({ preventScroll: true });
                }
            }
        },
    };
}
