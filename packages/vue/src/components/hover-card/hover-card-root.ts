import { createHoverIntent } from "@fragiola/primitives/hover";
import { trackHoverBridge } from "@fragiola/primitives/pointer";
import type { Align, Side } from "@fragiola/primitives/positioning";
import {
    defineComponent,
    onBeforeUnmount,
    type PropType,
    provide,
    ref,
    shallowRef,
    watch,
} from "vue";
import {
    type OverlayRootEmits,
    type OverlayRootProps,
    type OverlayTriggerRootProps,
    overlayRootEmits,
    overlayRootProps,
    overlayTriggerRootProps,
    useOverlayRoot,
} from "../../composables/use-overlay-root.ts";
import { useAttachHandle } from "../../composables/use-overlay-trigger.ts";
import type { ChangeReason } from "../../utils/change-details.ts";
import {
    type OverlayRootSlots,
    type PublicComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { type HoverCardContext, HoverCardKey } from "./hover-card-context.ts";
import type { HoverCardHandle } from "./hover-card-handle.ts";

/**
 * Holds the card's state (`v-model:open`) and its hover intent; renders no element
 * (spec/hover-card.md). A template ref on it exposes the actions, `close()` and `unmount()`.
 */
export interface HoverCardRootProps
    extends OverlayRootProps,
        OverlayTriggerRootProps {
    /** ms before a hovered or keyboard-focused trigger opens it (default 600). */
    delay?: number;
    /** ms before it closes once the pointer left the trigger and the card (default 300). */
    closeDelay?: number;
    /** Connects Triggers rendered outside the Root (spec/hover-card.md, "Detached triggers"). */
    handle?: HoverCardHandle;
}

export type HoverCardRootEmits = OverlayRootEmits;

export const HoverCardRoot: PublicComponent<
    HoverCardRootProps,
    OverlayRootSlots,
    HoverCardRootEmits
> = publicComponent(
    defineComponent({
        name: "HoverCardRoot",
        props: {
            ...overlayRootProps,
            ...overlayTriggerRootProps,
            /** ms before a hovered or keyboard-focused trigger opens it. */
            delay: { type: Number, default: 600 },
            /** ms before it closes once the pointer left the trigger and the card. */
            closeDelay: { type: Number, default: 300 },
            handle: {
                type: Object as PropType<HoverCardHandle>,
                default: undefined,
            },
        },
        emits: overlayRootEmits,
        setup(props, { emit, slots, expose }) {
            const root = useOverlayRoot(props, emit);
            const instant = ref(false);
            let openedByHover = false;
            // the trigger the pointer is over, and what a pending delay opens from
            let hovered: HTMLElement | null = null;
            let pending: {
                reason: ChangeReason;
                trigger: HTMLElement | null;
                event: Event | undefined;
            } = { reason: "trigger-hover", trigger: null, event: undefined };

            const show = (
                reason: ChangeReason,
                isInstant: boolean,
                event?: Event,
                from?: HTMLElement | null,
            ) => {
                // set before the change: the hover bridge starts with it
                const wasByHover = openedByHover;
                openedByHover = reason === "trigger-hover";
                if (root.setOpen(true, reason, event, from)) {
                    instant.value = isInstant;
                } else {
                    openedByHover = wasByHover;
                }
            };
            const hide = (reason: ChangeReason, event?: Event) => {
                root.setOpen(false, reason, event);
            };
            const intent = createHoverIntent({
                open: () =>
                    show(pending.reason, false, pending.event, pending.trigger),
                close: () => hide("trigger-hover"),
            });
            onBeforeUnmount(intent.cancel);
            watch(
                () => root.open.value,
                (open) => {
                    if (!open) {
                        intent.cancel();
                    }
                },
            );

            // a hover-opened card closes once the pointer leaves the trigger, the card and the
            // safe area
            watch(
                () =>
                    [
                        root.open.value,
                        root.trigger.value,
                        root.popup.value,
                    ] as const,
                ([open, trigger, popup], _, onCleanup) => {
                    if (!open || !openedByHover || trigger === null) {
                        return;
                    }
                    onCleanup(
                        trackHoverBridge(trigger, popup, {
                            inside: () => intent.cancel(),
                            outside: () => {
                                // over another of its triggers: the card is moving there
                                if (
                                    hovered !== null &&
                                    hovered !== trigger &&
                                    hovered.isConnected &&
                                    root.triggers.value.includes(hovered)
                                ) {
                                    intent.cancel();
                                    return;
                                }
                                intent.leave(props.closeDelay);
                            },
                        }),
                    );
                },
                { immediate: true },
            );

            const context: HoverCardContext = {
                ...root,
                intentStart(reason, from, event) {
                    if (reason === "trigger-hover") {
                        hovered = from;
                    }
                    if (root.open.value) {
                        intent.cancel();
                        // another trigger of the open card: it moves there at once
                        if (from !== root.trigger.value) {
                            show(reason, true, event, from);
                        }
                        return;
                    }
                    pending = { reason, trigger: from, event };
                    intent.enter(props.delay);
                },
                hoverEnd(from) {
                    if (hovered === from) {
                        hovered = null;
                    }
                    if (!root.open.value) {
                        intent.cancel();
                    }
                },
                blur(from, event) {
                    const next = event.relatedTarget;
                    if (!root.open.value) {
                        if (pending.reason === "trigger-focus") {
                            intent.cancel();
                        }
                        return;
                    }
                    if (from !== root.trigger.value) {
                        return;
                    }
                    // focus moving into the card keeps it open
                    if (
                        next instanceof Node &&
                        (root.popup.value?.contains(next) ||
                            root.positioner.value?.contains(next))
                    ) {
                        return;
                    }
                    intent.cancel();
                    hide("trigger-focus", event);
                },
                instant,
                arrow: shallowRef(null),
                placed: ref<{ side: Side; align: Align }>({
                    side: "bottom",
                    align: "center",
                }),
            };
            provide(HoverCardKey, context);
            useAttachHandle(() => props.handle, context);
            expose(root.actions);
            return () => slots.default?.({ payload: root.payload.value });
        },
    }),
);
