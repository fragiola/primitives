import {
    focusInitial,
    getTabbables,
    nextTabbableAfter,
} from "@fragiola/primitives/focus";
import { openOverlaySession } from "@fragiola/primitives/overlay";
import type { Align, Side } from "@fragiola/primitives/positioning";
import { defineComponent, watch } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { ColorPickerPopoverKey } from "./color-picker-popover-context.ts";

export interface ColorPickerPopoverPopupState {
    open: boolean;
    side: Side;
    align: Align;
}

export type ColorPickerPopoverPopupProps = Record<never, never>;

// Closing by these returns focus to the trigger; focus leaving does not (spec/popover.md).
const RETURNS_FOCUS = new Set(["escape-key", "trigger-press"]);
// an outside press returns it only when the press focused nothing (D4 §3, Base UI), as a close
// made through the controlled `open` (`none`) or the actions (`imperative-action`) does
const RETURNS_FOCUS_UNFOCUSED = new Set([
    "outside-press",
    "none",
    "imperative-action",
]);

/**
 * The picker's non-modal dialog (spec/color-picker.md, Popover's focus and dismissal): not
 * trapped, it closes when focus leaves it; on open, its first tabbable element takes the focus.
 */
export const ColorPickerPopoverPopup: PartComponent<
    ColorPickerPopoverPopupProps,
    ColorPickerPopoverPopupState
> = publicComponent(
    defineComponent({
        name: "ColorPickerPopoverPopup",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                ColorPickerPopoverKey,
                "ColorPickerPopover.Popup",
            );
            const setPopup = elementSetter(context.popup);
            const onKeydown = (event: KeyboardEvent) => {
                const popup = context.popup.value;
                if (
                    event.key !== "Tab" ||
                    popup === null ||
                    event.defaultPrevented
                ) {
                    return;
                }
                // in the tab order, the popup's content comes right after the trigger (as
                // popover.md)
                const tabbables = getTabbables(popup);
                const active = popup.ownerDocument.activeElement;
                const first = tabbables[0] ?? popup;
                const last = tabbables.at(-1) ?? popup;
                const trigger = context.trigger.value;
                if (event.shiftKey && (active === first || active === popup)) {
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
                    const trigger = context.trigger.value;
                    const session = openOverlaySession(popup.ownerDocument, {
                        elements: () => [positioner ?? popup],
                        ignore: () => [trigger],
                        dismiss: (reason, event) =>
                            context.setOpen(false, reason, event),
                        focusOut: () => [trigger],
                        returnFocus: {
                            when: RETURNS_FOCUS,
                            whenUnfocused: RETURNS_FOCUS_UNFOCUSED,
                            reason: () => context.lastReason.current ?? "none",
                            to: () => trigger,
                        },
                    });
                    // a native listener: Vue's own skips an event whose timestamp is not later
                    // than the listener's, which a fixed test clock makes equal
                    popup.addEventListener("keydown", onKeydown);
                    onCleanup(() => {
                        popup.removeEventListener("keydown", onKeydown);
                        session.end();
                    });
                },
                { flush: "post", immediate: true },
            );
            // on open: the first tabbable element, else the popup (D4 §3 "Popover focus on open")
            watch(
                () => [context.open.value, context.popup.value] as const,
                ([open, popup]) => {
                    if (open && popup !== null) {
                        focusInitial(popup, undefined);
                    }
                },
                { flush: "post", immediate: true },
            );
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
                        tabindex: -1,
                        "data-primitives-part": "color-picker-popover-popup",
                        ...stateAttributes({
                            open,
                            closed: !open,
                            side: placed.side,
                            align: placed.align,
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
