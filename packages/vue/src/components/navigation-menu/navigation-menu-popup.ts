import { getTabbables, nextTabbableAfter } from "@fragiola/primitives/focus";
import { openOverlaySession } from "@fragiola/primitives/overlay";
import { isInHoverBridge } from "@fragiola/primitives/pointer";
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
import { NavigationMenuKey } from "./navigation-menu-context.ts";

const RETURNS_FOCUS = new Set(["escape-key"]);

/**
 * The shared popup (spec/navigation-menu.md): a non-modal layer of the overlay tree while a
 * Content is open, sized by the open Content (`--popup-width`, `--popup-height`); the pointer
 * leaving it and the Trigger closes a hover-opened Content after the close delay.
 */
export interface NavigationMenuPopupState {
    open: boolean;
    side: Side;
    align: Align;
}

export const NavigationMenuPopup: PartComponent<
    Record<never, never>,
    NavigationMenuPopupState
> = publicComponent(
    defineComponent({
        name: "NavigationMenuPopup",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                NavigationMenuKey,
                "NavigationMenu.Popup",
            );
            const setPopup = elementSetter(context.popup);
            watch(
                () =>
                    [
                        context.value.value !== null,
                        context.popup.value,
                        context.positioner.value,
                    ] as const,
                ([open, popup, positioner], _, onCleanup) => {
                    if (!open || popup === null) {
                        return;
                    }
                    const doc = popup.ownerDocument;
                    const layer = openOverlaySession(doc, {
                        elements: () => [positioner ?? popup],
                        // a press on the Root's List is its own (a Trigger toggles or switches)
                        ignore: () => [context.root.value],
                        owner: () => [context.activeTrigger.value],
                        dismiss: (reason, event) =>
                            context.setValue(null, reason, event),
                        focusOut: () => [context.root.value],
                        returnFocus: {
                            when: RETURNS_FOCUS,
                            reason: () => context.lastReason.current ?? "none",
                            // only when focus was inside the popup (APG: the button keeps it)
                            to: () =>
                                (positioner ?? popup).contains(
                                    doc.activeElement,
                                )
                                    ? context.activeTrigger.value
                                    : false,
                        },
                    });
                    context.layered.value = true;
                    // a hover-opened Content: the pointer leaving the Trigger and the popup (and
                    // the levels opened from it) closes it after the close delay
                    const onMove = (event: PointerEvent) => {
                        const trigger = context.activeTrigger.value;
                        if (
                            event.pointerType === "touch" ||
                            context.openedBy.by !== "hover" ||
                            trigger === null
                        ) {
                            return;
                        }
                        const target = event.target;
                        const inside =
                            isInHoverBridge(
                                { x: event.clientX, y: event.clientY },
                                trigger,
                                positioner ?? popup,
                            ) ||
                            (target instanceof Node &&
                                layer
                                    .elementsAbove()
                                    .some((element) =>
                                        element.contains(target),
                                    ));
                        if (inside) {
                            context.hover.cancel();
                        } else {
                            context.hover.leave(context.closeDelay());
                        }
                    };
                    doc.addEventListener("pointermove", onMove);
                    onCleanup(() => {
                        doc.removeEventListener("pointermove", onMove);
                        context.layered.value = false;
                        // a close delay still pending would close a later opening
                        context.hover.cancel();
                        layer.end();
                    });
                },
                { flush: "post", immediate: true },
            );

            const onKeydown = (event: KeyboardEvent) => {
                const trigger = context.activeTrigger.value;
                const popup = context.popup.value;
                if (
                    event.key !== "Tab" ||
                    popup === null ||
                    trigger === null ||
                    event.defaultPrevented ||
                    !popup.contains(event.target as Node)
                ) {
                    return;
                }
                const tabbables = getTabbables(popup);
                const active = popup.ownerDocument.activeElement;
                if (event.shiftKey && active === tabbables[0]) {
                    event.preventDefault();
                    trigger.focus();
                } else if (!event.shiftKey && active === tabbables.at(-1)) {
                    // in the tab order, the Content comes right after its Trigger
                    const next = nextTabbableAfter(trigger, [
                        context.positioner.value,
                        popup,
                    ]);
                    if (next) {
                        event.preventDefault();
                        next.focus();
                    }
                }
            };
            return () => {
                const open = context.value.value !== null;
                const placed = context.placed.value;
                const status = context.presence.status.value;
                const size = context.size.value;
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    { open, ...placed },
                    {
                        "data-primitives-part": "navigation-menu-popup",
                        ...stateAttributes({
                            open,
                            closed: !open,
                            side: placed.side,
                            align: placed.align,
                            "starting-style": status === "starting",
                            "ending-style": status === "ending",
                        }),
                        style: size
                            ? {
                                  "--popup-width": `${size.width}px`,
                                  "--popup-height": `${size.height}px`,
                              }
                            : undefined,
                        onKeydown,
                        ref: setPopup,
                    },
                );
            };
        },
    }),
);
