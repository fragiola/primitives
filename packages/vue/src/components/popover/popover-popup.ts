import {
    focusInitial,
    getTabbables,
    nextTabbableAfter,
} from "@fragiola/primitives/focus";
import { openOverlaySession } from "@fragiola/primitives/overlay";
import type { Align, Side } from "@fragiola/primitives/positioning";
import { defineComponent, type PropType, watch } from "vue";
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
import { PopoverKey } from "./popover-context.ts";

// Closing by these returns focus to the trigger; focus leaving does not (spec/popover.md).
const RETURNS_FOCUS = new Set(["escape-key", "close-press", "trigger-press"]);
// an outside press returns it only when the press focused nothing (D4 §3, Base UI); so does a
// close made through the controlled `open` (reason `none`): focus left inside the popup goes back
// (and a handle's or the actions' `imperative-action`, whose focus return is `none`'s)
const RETURNS_FOCUS_UNFOCUSED = new Set([
    "outside-press",
    "none",
    "imperative-action",
]);

/** The non-modal popover (spec/popover.md): not trapped, it closes when focus leaves it. */
export interface PopoverPopupState {
    open: boolean;
    side: Side;
    align: Align;
}

export interface PopoverPopupProps {
    /** Focused on open (default: the first tabbable element, else the popup; `false`: none). */
    initialFocus?: FocusTarget;
    /** Focused when focus returns on close (default: the trigger). */
    finalFocus?: FocusTarget;
}

export const PopoverPopup: PartComponent<PopoverPopupProps, PopoverPopupState> =
    publicComponent(
        defineComponent({
            name: "PopoverPopup",
            inheritAttrs: false,
            props: {
                ...asProp,
                initialFocus: {
                    type: [Object, Boolean, Function] as PropType<FocusTarget>,
                    default: undefined,
                },
                finalFocus: {
                    type: [Object, Boolean, Function] as PropType<FocusTarget>,
                    default: undefined,
                },
            },
            setup(props, { attrs, slots }) {
                const context = useRequiredContext(PopoverKey, "Popover.Popup");
                const setPopup = elementSetter(context.popup);
                watch(
                    () =>
                        [
                            context.open.value,
                            context.popup.value,
                            context.positioner.value,
                        ] as const,
                    ([open, popup, positioner], _, onCleanup) => {
                        if (!open || popup === null) {
                            return;
                        }
                        // the triggers are read when the session needs them: the active trigger
                        // may move while it is open
                        const session = openOverlaySession(
                            popup.ownerDocument,
                            {
                                elements: () => [positioner ?? popup],
                                ignore: () => context.triggers.value,
                                dismiss: (reason, event) =>
                                    context.setOpen(false, reason, event),
                                focusOut: () => context.triggers.value,
                                returnFocus: {
                                    when: RETURNS_FOCUS,
                                    whenUnfocused: RETURNS_FOCUS_UNFOCUSED,
                                    reason: () =>
                                        context.lastReason.current ?? "none",
                                    to: () => {
                                        const final = resolveFocusTarget(
                                            props.finalFocus,
                                        );
                                        return final === false
                                            ? false
                                            : (final ?? context.trigger.value);
                                    },
                                },
                            },
                        );
                        onCleanup(session.end);
                    },
                    { flush: "post", immediate: true },
                );
                // on open, and when it moves to another trigger: the first tabbable element, else
                // the popup (D4 §3 "Popover focus on open")
                watch(
                    () =>
                        [
                            context.open.value,
                            context.popup.value,
                            context.trigger.value,
                        ] as const,
                    ([open, popup]) => {
                        if (!open || popup === null) {
                            return;
                        }
                        const initial = resolveFocusTarget(props.initialFocus);
                        if (initial !== false) {
                            focusInitial(popup, initial);
                        }
                    },
                    { flush: "post", immediate: true },
                );

                const onKeydown = (event: KeyboardEvent) => {
                    const popup = context.popup.value;
                    if (
                        event.key !== "Tab" ||
                        popup === null ||
                        event.defaultPrevented
                    ) {
                        return;
                    }
                    // in the tab order, the popup's content comes right after the trigger
                    const tabbables = getTabbables(popup);
                    const active = popup.ownerDocument.activeElement;
                    const first = tabbables[0] ?? popup;
                    const last = tabbables.at(-1) ?? popup;
                    const trigger = context.trigger.value;
                    if (
                        event.shiftKey &&
                        (active === first || active === popup)
                    ) {
                        event.preventDefault();
                        context.setOpen(false, "focus-out", event);
                        trigger?.focus();
                    } else if (!event.shiftKey && active === last) {
                        event.preventDefault();
                        const next = trigger
                            ? nextTabbableAfter(trigger, [
                                  context.positioner.value,
                                  popup,
                              ])
                            : null;
                        context.setOpen(false, "focus-out", event);
                        next?.focus();
                    }
                };

                return () => {
                    const open = context.open.value;
                    const status = context.presence.status.value;
                    const placed = context.placed.value;
                    return renderPart(
                        "div",
                        { attrs, slots },
                        props.as,
                        { open, ...placed },
                        {
                            id: context.popupId,
                            role: "dialog",
                            "aria-labelledby": context.titleId.value,
                            "aria-describedby": context.descriptionId.value,
                            tabindex: -1,
                            "data-primitives-part": "popover-popup",
                            ...stateAttributes({
                                open,
                                closed: !open,
                                side: placed.side,
                                align: placed.align,
                                "starting-style": status === "starting",
                                "ending-style": status === "ending",
                            }),
                            onKeydown,
                            ref: setPopup,
                        },
                    );
                };
            },
        }),
    );
