import { getTabbables, nextTabbableAfter } from "@fragiola/primitives/focus";
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
import { DatePickerKey } from "./date-picker-context.ts";

export interface DatePickerPopupState {
    open: boolean;
    side: Side;
    align: Align;
}

export type DatePickerPopupProps = Record<never, never>;

// Closing by these returns focus to the trigger; focus leaving does not (spec/calendar.md, "Focus").
const RETURNS_FOCUS = new Set(["escape-key", "item-press", "trigger-press"]);
// an outside press returns it only when the press focused nothing (as Popover, D4 §3)
// and a close made through the controlled `open` (reason `none`), as Popover's
// (and the actions' `imperative-action`, whose focus return is `none`'s)
const RETURNS_FOCUS_UNFOCUSED = new Set([
    "outside-press",
    "none",
    "imperative-action",
]);

/** The non-modal dialog holding the bound calendar (spec/calendar.md, pickers). */
export const DatePickerPopup: PartComponent<
    DatePickerPopupProps,
    DatePickerPopupState
> = publicComponent(
    defineComponent({
        name: "DatePickerPopup",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                DatePickerKey,
                "DatePicker.Popup",
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
                    // the bound calendar focuses its focused date itself, once the popup is a layer:
                    // inside another overlay (a Dialog's focus trap), the focus then moves into a
                    // child layer of it (spec/calendar.md, "Focus")
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
                    // than the listener's, which a fixed clock (the tests' "today") makes equal
                    // once a child's Vue listener (the calendar cell's keydown) has seen the event
                    popup.addEventListener("keydown", onKeydown);
                    context.layered.value = true;
                    onCleanup(() => {
                        popup.removeEventListener("keydown", onKeydown);
                        context.layered.value = false;
                        session.end();
                    });
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
                        "data-primitives-part": `${context.component}-popup`,
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
