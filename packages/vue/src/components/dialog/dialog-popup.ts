import { focusInitial, trapFocus } from "@fragiola/primitives/focus";
import { inertOutside } from "@fragiola/primitives/inert";
import { openOverlaySession } from "@fragiola/primitives/overlay";
import { lockScroll } from "@fragiola/primitives/scroll-lock";
import { defineComponent, type PropType, provide, watch } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type FocusTarget,
    resolveFocusTarget,
} from "../../utils/change-details.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { DialogKey, DialogNestingKey } from "./dialog-context.ts";

/** The modal dialog (spec/dialog.md): focus trap, inert page, scroll lock, its own layer. */
export interface DialogPopupState {
    open: boolean;
    nested: boolean;
    nestedDialogOpen: boolean;
}

export interface DialogPopupProps {
    /** Focused on open (default: the first tabbable element, else the popup). */
    initialFocus?: FocusTarget;
    /** Focused on close (default: the active trigger, else the element focused before opening). */
    finalFocus?: FocusTarget;
}

// a press on the backdrop or the viewport blurs the page: focus returns once the press has ended
const RETURNS_FOCUS_UNFOCUSED = new Set(["outside-press"]);

export const DialogPopup: PartComponent<DialogPopupProps, DialogPopupState> =
    publicComponent(
        defineComponent({
            name: "DialogPopup",
            inheritAttrs: false,
            props: {
                ...asProp,
                /** Focused on open (default: the first tabbable element, else the popup). */
                initialFocus: {
                    type: [Object, Boolean, Function] as PropType<FocusTarget>,
                    default: undefined,
                },
                /** Focused on close (default: the trigger, else the element focused before opening). */
                finalFocus: {
                    type: [Object, Boolean, Function] as PropType<FocusTarget>,
                    default: undefined,
                },
            },
            setup(props, { attrs, slots }) {
                const context = useRequiredContext(DialogKey, "Dialog.Popup");
                const setPopup = elementSetter(context.popup);
                // the dialogs nested in it report their open chain here
                provide(DialogNestingKey, context.nesting);
                watch(
                    () =>
                        [
                            context.open.value,
                            context.popup.value,
                            context.backdrop.value,
                            context.viewport.value,
                        ] as const,
                    ([open, popup, backdrop, viewport], _, onCleanup) => {
                        if (!open || popup === null) {
                            return;
                        }
                        const doc = popup.ownerDocument;
                        const previous =
                            doc.activeElement instanceof HTMLElement
                                ? doc.activeElement
                                : null;
                        // the triggers are read when the session needs them: a trigger registered
                        // later, or the active one moving, never restarts the session
                        const session = openOverlaySession(doc, {
                            elements: () => [popup],
                            owner: () => context.triggers.value,
                            // a press on the backdrop or the viewport is outside this dialog,
                            // inside its parent
                            backdrops: () => [backdrop, viewport],
                            dismiss: (reason, event) =>
                                context.setOpen(false, reason, event),
                            returnFocus: {
                                whenUnfocused: RETURNS_FOCUS_UNFOCUSED,
                                reason: () =>
                                    context.lastReason.current ?? "none",
                                to: () => {
                                    const final = resolveFocusTarget(
                                        props.finalFocus,
                                    );
                                    return final === false
                                        ? false
                                        : (final ??
                                              context.trigger.value ??
                                              previous);
                                },
                            },
                        });
                        const initial = resolveFocusTarget(props.initialFocus);
                        focusInitial(
                            popup,
                            initial === false ? popup : initial,
                        );
                        const release = trapFocus(popup, session.elementsAbove);
                        const unlock = lockScroll(doc);
                        const restoreInert = inertOutside(
                            backdrop ? [popup, backdrop] : [popup],
                        );
                        onCleanup(() => {
                            release();
                            unlock();
                            restoreInert();
                            session.end();
                        });
                    },
                    { flush: "post", immediate: true },
                );
                return () => {
                    const open = context.open.value;
                    const status = context.presence.status.value;
                    const nested = context.nested;
                    const nestedDialogs = context.nestedDialogs.value;
                    const nestedDialogOpen = nestedDialogs > 0;
                    return renderPart(
                        "div",
                        { attrs, slots },
                        props.as,
                        { open, nested, nestedDialogOpen },
                        {
                            id: context.popupId,
                            role: "dialog",
                            "aria-modal": "true",
                            "aria-labelledby": context.titleId.value,
                            "aria-describedby": context.descriptionId.value,
                            tabindex: -1,
                            hidden: context.presence.mounted.value
                                ? undefined
                                : true,
                            // the open chain of dialogs nested below it, for a recipe
                            // (spec/dialog.md, "Nested dialogs")
                            style: { "--nested-dialogs": nestedDialogs },
                            "data-primitives-part": "dialog-popup",
                            ...stateAttributes({
                                open,
                                closed: !open,
                                nested,
                                "nested-dialog-open": nestedDialogOpen,
                                "starting-style": status === "starting",
                                "ending-style": status === "ending",
                            }),
                            ref: setPopup,
                        },
                    );
                };
            },
        }),
    );
