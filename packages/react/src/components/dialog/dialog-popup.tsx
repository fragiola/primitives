import { focusInitial, trapFocus } from "@fragiola/primitives/focus";
import { inertOutside } from "@fragiola/primitives/inert";
import { openOverlaySession } from "@fragiola/primitives/overlay";
import { lockScroll } from "@fragiola/primitives/scroll-lock";
import { type CSSProperties, useEffect, useRef } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import {
    type FocusTarget,
    resolveFocusTarget,
} from "../../utils/change-details.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { DialogContext, DialogNestingContext } from "./dialog-context.ts";

export interface DialogPopupState {
    open: boolean;
    nested: boolean;
    nestedDialogOpen: boolean;
}

export interface DialogPopupProps extends PartProps<DialogPopupState> {
    /**
     * Focused on open (default: the first tabbable element, else the popup; an AlertDialog's
     * first Close first).
     */
    initialFocus?: FocusTarget;
    /** Focused on close (default: the active trigger, else the element focused before opening). */
    finalFocus?: FocusTarget;
}

const RETURNS_FOCUS_UNFOCUSED = new Set(["outside-press"]);

/** An AlertDialog's default initial focus: its first Close (spec/alert-dialog.md, "Focus"). */
function firstClose(popup: HTMLElement, component: string): HTMLElement | null {
    return popup.querySelector<HTMLElement>(
        `[data-primitives-part="${component}-close"]:not([disabled])`,
    );
}

/** The modal dialog (spec/dialog.md): focus trap, inert page, scroll lock, its own layer. */
export function DialogPopup({
    initialFocus,
    finalFocus,
    style,
    children,
    ...props
}: DialogPopupProps) {
    const context = useRequiredContext(DialogContext, "Dialog.Popup");
    const { open, popup, backdrop, viewport, setOpen, lastReason, component } =
        context;
    // an alert dialog is never dismissed from outside (spec/alert-dialog.md)
    const alert = component === "alert-dialog";
    const focusTargets = useRef({ initialFocus, finalFocus });
    focusTargets.current = { initialFocus, finalFocus };
    // read when the session needs them: a trigger registered later, or the active one moving,
    // never restarts the session
    const triggers = useRef(context);
    triggers.current = context;

    useEffect(() => {
        if (!open || popup === null) {
            return undefined;
        }
        const doc = popup.ownerDocument;
        const previous =
            doc.activeElement instanceof HTMLElement ? doc.activeElement : null;
        const session = openOverlaySession(doc, {
            elements: () => [popup],
            owner: () => triggers.current.triggers,
            // a press on the backdrop or the viewport is outside this dialog, inside its parent
            backdrops: () => [backdrop, viewport],
            // the page under it is inert: a press outside it lands in the overlay it was opened
            // from, which stays open (spec/dialog.md, "Dismissal and layering")
            modal: true,
            dismiss: (reason, event) => {
                if (alert && reason === "outside-press") {
                    return;
                }
                setOpen(false, reason, event);
            },
            returnFocus: {
                // a press on the backdrop or the viewport blurs the page: focus returns once the
                // press has ended
                whenUnfocused: RETURNS_FOCUS_UNFOCUSED,
                reason: () => lastReason.current ?? "none",
                to: () => {
                    const final = resolveFocusTarget(
                        focusTargets.current.finalFocus,
                    );
                    return final === false
                        ? false
                        : (final ?? triggers.current.trigger ?? previous);
                },
            },
        });
        const initial = resolveFocusTarget(focusTargets.current.initialFocus);
        focusInitial(
            popup,
            initial === false
                ? popup
                : (initial ?? (alert ? firstClose(popup, component) : null)),
        );
        // an alert dialog's outside press keeps the focus where it is
        const release = trapFocus(popup, session.elementsAbove, {
            holdOutsidePress: alert,
        });
        const unlock = lockScroll(doc);
        const restoreInert = inertOutside(
            backdrop ? [popup, backdrop] : [popup],
        );
        return () => {
            release();
            unlock();
            restoreInert();
            session.end();
        };
    }, [
        open,
        popup,
        backdrop,
        viewport,
        setOpen,
        lastReason,
        alert,
        component,
    ]);

    const { nested, nestedDialogs, presence } = context;
    const status = presence.status;
    const nestedDialogOpen = nestedDialogs > 0;
    const state = { open, nested, nestedDialogOpen };
    const resolvedStyle = typeof style === "function" ? style(state) : style;
    // the open chain of dialogs nested below it, for a recipe (spec/dialog.md, "Nested dialogs")
    const nestedStyle = {
        "--nested-dialogs": nestedDialogs,
        ...resolvedStyle,
    } as CSSProperties;
    return renderElement(
        "div",
        { ...props, style: nestedStyle },
        state,
        {
            id: context.popupId,
            role: alert ? "alertdialog" : "dialog",
            "aria-modal": "true",
            "aria-labelledby": context.titleId,
            "aria-describedby": context.descriptionId,
            tabIndex: -1,
            hidden: presence.mounted ? undefined : true,
            "data-primitives-part": `${context.component}-popup`,
            ...stateAttributes({
                open,
                closed: !open,
                nested,
                "nested-dialog-open": nestedDialogOpen,
                "starting-style": status === "starting",
                "ending-style": status === "ending",
            }),
            children: (
                <DialogNestingContext.Provider value={context.nesting}>
                    {children}
                </DialogNestingContext.Provider>
            ),
        },
        context.setPopup,
    );
}
