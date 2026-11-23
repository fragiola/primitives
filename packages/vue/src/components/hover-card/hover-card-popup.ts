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
import { HoverCardKey } from "./hover-card-context.ts";

/**
 * The card (spec/hover-card.md): a non-modal layer (Escape, an outside press), which never takes
 * focus on open and closes when focus leaves it.
 */
export interface HoverCardPopupState {
    open: boolean;
    instant: boolean;
    side: Side;
    align: Align;
}

export const HoverCardPopup: PartComponent<
    Record<never, never>,
    HoverCardPopupState
> = publicComponent(
    defineComponent({
        name: "HoverCardPopup",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(HoverCardKey, "HoverCard.Popup");
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
                    // the triggers are read when the layer needs them: the active trigger may
                    // move while it is open
                    const session = openOverlaySession(popup.ownerDocument, {
                        elements: () => [positioner ?? popup],
                        ignore: () => context.triggers.value,
                        dismiss: (reason, event) =>
                            context.setOpen(false, reason, event),
                    });
                    onCleanup(session.end);
                },
                { flush: "post", immediate: true },
            );
            const onFocusout = (event: FocusEvent) => {
                const next = event.relatedTarget;
                if (
                    !context.open.value ||
                    !(next instanceof Node) ||
                    context.popup.value?.contains(next) ||
                    context.positioner.value?.contains(next) ||
                    context.triggers.value.some((trigger) =>
                        trigger.contains(next),
                    )
                ) {
                    return;
                }
                context.setOpen(false, "focus-out", event);
            };
            return () => {
                const open = context.open.value;
                const instant = context.instant.value;
                const placed = context.placed.value;
                const status = context.presence.status.value;
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    { open, instant, ...placed },
                    {
                        id: context.popupId,
                        tabindex: -1,
                        "data-primitives-part": "hover-card-popup",
                        ...stateAttributes({
                            open,
                            closed: !open,
                            side: placed.side,
                            align: placed.align,
                            instant,
                            "starting-style": status === "starting",
                            "ending-style": status === "ending",
                        }),
                        onFocusout,
                        ref: setPopup,
                    },
                );
            };
        },
    }),
);
