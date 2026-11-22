import {
    createDelayGroup,
    createHoverIntent,
} from "@fragiola/primitives/hover";
import { interceptEscape } from "@fragiola/primitives/layers";
import { trackHoverBridge } from "@fragiola/primitives/pointer";
import type { Align, Side } from "@fragiola/primitives/positioning";
import {
    defineComponent,
    inject,
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
import {
    type TooltipContext,
    TooltipKey,
    TooltipProviderKey,
} from "./tooltip-context.ts";
import type { TooltipHandle } from "./tooltip-handle.ts";

/**
 * Holds the tooltip's state (`v-model:open`) and its hover intent; renders no element
 * (spec/tooltip.md). A template ref on it exposes the actions, `close()` and `unmount()`.
 */
export interface TooltipRootProps
    extends OverlayRootProps,
        OverlayTriggerRootProps {
    /** ms before a hovered trigger opens (default: the Provider's, else 600). */
    delay?: number;
    /** ms before it closes once the pointer left (default: the Provider's, else 0). */
    closeDelay?: number;
    disabled?: boolean;
    /** Connects Triggers rendered outside the Root (spec/tooltip.md, "Detached triggers"). */
    handle?: TooltipHandle;
}

export type TooltipRootEmits = OverlayRootEmits;

export const TooltipRoot: PublicComponent<
    TooltipRootProps,
    OverlayRootSlots,
    TooltipRootEmits
> = publicComponent(
    defineComponent({
        name: "TooltipRoot",
        props: {
            ...overlayRootProps,
            ...overlayTriggerRootProps,
            /** ms before a hovered trigger opens (default: the Provider's, else 600). */
            delay: { type: Number, default: undefined },
            /** ms before it closes once the pointer left (default: the Provider's, else 0). */
            closeDelay: { type: Number, default: undefined },
            disabled: { type: Boolean, default: false },
            handle: {
                type: Object as PropType<TooltipHandle>,
                default: undefined,
            },
        },
        emits: overlayRootEmits,
        setup(props, { emit, slots, expose }) {
            const root = useOverlayRoot(props, emit);
            const provider = inject(TooltipProviderKey, null);
            // a Root outside any Provider is alone in its own group
            const group = provider?.group ?? createDelayGroup({ timeout: 0 });
            const delay = () => props.delay ?? provider?.delay() ?? 600;
            const closeDelay = () =>
                props.closeDelay ?? provider?.closeDelay() ?? 0;
            const instant = ref(false);
            let blocked = false;
            let openedByHover = false;
            // the trigger the pointer is over, and the one a pending hover delay opens from
            let hovered: HTMLElement | null = null;
            let pendingTrigger: HTMLElement | null = null;
            let pendingEvent: Event | undefined;

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
                    show("trigger-hover", false, pendingEvent, pendingTrigger),
                close: () => hide("trigger-hover"),
            });
            onBeforeUnmount(intent.cancel);

            // one open tooltip per group: the previous one closes when this one opens
            const member = () => hide("trigger-hover");
            watch(
                () => root.open.value,
                (open, _, onCleanup) => {
                    if (!open) {
                        return;
                    }
                    group.opened(member);
                    onCleanup(() => group.closed(member));
                },
                { immediate: true },
            );

            // a hover-opened tooltip closes once the pointer leaves the trigger, the popup and the gap
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
                                // over another of its triggers: the tooltip is moving there
                                // (a trigger removed while hovered is none: it never reports
                                // the pointer leaving)
                                if (
                                    hovered !== null &&
                                    hovered !== trigger &&
                                    hovered.isConnected &&
                                    root.triggers.value.includes(hovered)
                                ) {
                                    intent.cancel();
                                    return;
                                }
                                intent.leave(closeDelay());
                            },
                        }),
                    );
                },
                { immediate: true },
            );

            // Escape closes it and stops there: an enclosing layer stays open
            watch(
                () => [root.open.value, root.trigger.value] as const,
                ([open, trigger], _, onCleanup) => {
                    if (!open || trigger === null) {
                        return;
                    }
                    onCleanup(
                        interceptEscape(trigger.ownerDocument, (event) => {
                            intent.cancel();
                            hide("escape-key", event);
                        }),
                    );
                },
                { immediate: true },
            );

            const context: TooltipContext = {
                ...root,
                show,
                hide,
                hoverStart(from, event) {
                    hovered = from;
                    if (props.disabled || blocked) {
                        return;
                    }
                    if (root.open.value) {
                        intent.cancel();
                        // another trigger of the open tooltip: it moves there at once
                        // (spec/tooltip.md)
                        if (from !== root.trigger.value) {
                            show("trigger-hover", true, event, from);
                        }
                    } else if (group.isInstant()) {
                        intent.cancel();
                        show("trigger-hover", true, event, from);
                    } else {
                        pendingTrigger = from;
                        pendingEvent = event;
                        intent.enter(delay());
                    }
                },
                hoverEnd(from) {
                    if (hovered === from) {
                        hovered = null;
                    }
                    blocked = false;
                    if (!root.open.value) {
                        intent.cancel();
                    }
                },
                press(event) {
                    blocked = true;
                    intent.cancel();
                    if (root.open.value) {
                        hide("trigger-press", event);
                    }
                },
                instant,
                disabled: () => props.disabled,
                arrow: shallowRef(null),
                placed: ref<{ side: Side; align: Align }>({
                    side: "top",
                    align: "center",
                }),
            };
            provide(TooltipKey, context);
            useAttachHandle(() => props.handle, context);
            expose(root.actions);
            return () => slots.default?.({ payload: root.payload.value });
        },
    }),
);
