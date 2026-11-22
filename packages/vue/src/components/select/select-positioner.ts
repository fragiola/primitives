import { blockOutsidePointer } from "@fragiola/primitives/inert";
import { openOverlaySession } from "@fragiola/primitives/overlay";
import type { Align, Side } from "@fragiola/primitives/positioning";
import { lockScroll } from "@fragiola/primitives/scroll-lock";
import { defineComponent, watch } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import type { PositionerProps } from "../../composables/use-positioner.ts";
import {
    positionerProps,
    usePositioner,
} from "../../composables/use-positioner.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { SelectKey } from "./select-context.ts";

// a modal select's outside press reaches nothing: the press would leave focus on the body, so it
// goes back to the trigger, which keeps it (spec/select.md, "Modal")
const MODAL_RETURNS_FOCUS_UNFOCUSED = new Set(["outside-press"]);
const NEVER = new Set<string>();

export interface SelectPositionerState {
    open: boolean;
    side: Side;
    align: Align;
}

/**
 * Places the list below the trigger (spec/select.md, "Item alignment"); the open list is a layer
 * (Escape, outside press).
 */
export const SelectPositioner: PartComponent<
    PositionerProps,
    SelectPositionerState
> = publicComponent(
    defineComponent({
        name: "SelectPositioner",
        inheritAttrs: false,
        props: {
            ...asProp,
            ...positionerProps,
            sideOffset: { type: Number, default: 4 },
        },
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(SelectKey, "Select.Positioner");
            const setPositioner = elementSetter(context.positioner);
            const placed = usePositioner(
                props,
                { side: "bottom", align: "start" },
                context.trigger,
                context.positioner,
                null,
                context.presence.mounted,
            );
            watch(placed, (value) => (context.placed.value = value), {
                immediate: true,
            });
            watch(
                () => [context.open.value, context.positioner.value] as const,
                ([open, positioner], _, onCleanup) => {
                    if (!open || positioner === null) {
                        return;
                    }
                    const session = openOverlaySession(
                        positioner.ownerDocument,
                        {
                            elements: () => [positioner],
                            ignore: () => [context.trigger.value],
                            dismiss: (reason, event) =>
                                context.setOpen(false, reason, event),
                            returnFocus: {
                                when: NEVER,
                                whenUnfocused: () =>
                                    context.modal()
                                        ? MODAL_RETURNS_FOCUS_UNFOCUSED
                                        : undefined,
                                reason: () => context.lastReason.current,
                                to: () => context.trigger.value,
                            },
                        },
                    );
                    onCleanup(session.end);
                },
                { flush: "post", immediate: true },
            );
            // spec/select.md, "Modal": the scroll lock and the outside pointer block, on their own, so
            // toggling `modal` while open keeps the session as it is
            watch(
                () =>
                    [
                        context.open.value,
                        context.positioner.value,
                        context.modal(),
                    ] as const,
                ([open, positioner, modal], _, onCleanup) => {
                    if (!open || positioner === null || !modal) {
                        return;
                    }
                    const doc = positioner.ownerDocument;
                    const unlock = lockScroll(doc);
                    const unblock = blockOutsidePointer(doc);
                    onCleanup(() => {
                        unblock();
                        unlock();
                    });
                },
                { flush: "post", immediate: true },
            );
            return () => {
                const open = context.open.value;
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    { open, ...placed.value },
                    {
                        role: "presentation",
                        hidden: context.presence.mounted.value
                            ? undefined
                            : true,
                        // a modal select blocks the pointer outside; its list takes it back
                        // (spec/select.md)
                        style: context.modal()
                            ? { pointerEvents: "auto" }
                            : undefined,
                        "data-primitives-part": "select-positioner",
                        ...stateAttributes({
                            open,
                            closed: !open,
                            side: placed.value.side,
                            align: placed.value.align,
                        }),
                        ref: setPositioner,
                    },
                );
            };
        },
    }),
);
