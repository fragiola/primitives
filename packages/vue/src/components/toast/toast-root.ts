import {
    type SwipeDirection,
    swipeMovement,
    swipeRelease,
    watchSwipe,
} from "@fragiola/primitives/swipe";
import {
    measureToastHeight,
    type ToastObject,
} from "@fragiola/primitives/toast";
import {
    computed,
    defineComponent,
    inject,
    type PropType,
    provide,
    ref,
    shallowRef,
    watch,
} from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { usePresence } from "../../composables/use-presence.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    ToastProviderKey,
    ToastRootKey,
    ToastViewportKey,
} from "./toast-context.ts";

/** One toast (spec/toast.md): its presence, its measure, its swipe and Escape. */
export interface ToastRootState {
    type: string | undefined;
    expanded: boolean;
    limited: boolean;
    swiping: boolean;
    swipeDirection: SwipeDirection | undefined;
}

export interface ToastRootProps {
    /** The toast of the queue it renders. */
    toast: ToastObject<unknown>;
    /** The edge a swipe dismisses it towards (default `right`). */
    swipeDirection?: SwipeDirection;
}

interface Swipe {
    swiping: boolean;
    direction: SwipeDirection | undefined;
    x: number;
    y: number;
}

const AT_REST: Swipe = { swiping: false, direction: undefined, x: 0, y: 0 };

export const ToastRoot: PartComponent<ToastRootProps, ToastRootState> =
    publicComponent(
        defineComponent({
            name: "ToastRoot",
            inheritAttrs: false,
            props: {
                ...asProp,
                toast: {
                    type: Object as PropType<ToastObject<unknown>>,
                    required: true,
                },
                swipeDirection: {
                    type: String as PropType<SwipeDirection>,
                    default: "right",
                },
            },
            setup(props, { attrs, slots }) {
                const provider = useRequiredContext(
                    ToastProviderKey,
                    "Toast.Root",
                );
                const viewport = inject(ToastViewportKey, null);
                const element = shallowRef<HTMLElement | null>(null);
                const setElement = elementSetter(element);
                const titleId = ref<string | undefined>();
                const descriptionId = ref<string | undefined>();
                const swipe = ref<Swipe>(AT_REST);
                const manager = () => provider.manager();

                const open = computed(() => !props.toast.closing);
                const presence = usePresence(open, () => element.value, {
                    onComplete: (isOpen) => {
                        if (!isOpen) {
                            manager().remove(props.toast.id);
                        }
                    },
                });

                // its natural height, on mount and on every update (spec/toast.md, "Stacking")
                watch(
                    () =>
                        [
                            element.value,
                            props.toast.updateKey,
                            props.toast.closing,
                        ] as const,
                    ([root, , closing]) => {
                        if (root !== null && !closing) {
                            manager().setHeight(
                                props.toast.id,
                                measureToastHeight(root),
                            );
                        }
                    },
                    { flush: "post", immediate: true },
                );

                const close = () => {
                    const root = element.value;
                    if (root !== null) {
                        viewport?.focusAfterClose(root);
                    }
                    manager().close(props.toast.id);
                };

                watch(
                    () =>
                        [
                            element.value,
                            props.toast.closing,
                            props.swipeDirection,
                        ] as const,
                    ([root, closing, direction], _, onCleanup) => {
                        if (root === null || closing) {
                            return;
                        }
                        let ended = false;
                        const stopSwipe = watchSwipe(root, {
                            directions: [direction],
                            onStart: () => {
                                manager().pause("swipe");
                                swipe.value = {
                                    ...AT_REST,
                                    swiping: true,
                                    direction,
                                };
                            },
                            onMove: (move) => {
                                const moved = swipeMovement(direction, move);
                                swipe.value = {
                                    swiping: true,
                                    direction,
                                    ...moved,
                                };
                            },
                            onEnd: (end) => {
                                manager().resume("swipe");
                                const size =
                                    direction === "left" ||
                                    direction === "right"
                                        ? root.offsetWidth
                                        : root.offsetHeight;
                                if (
                                    end !== null &&
                                    swipeRelease(direction, end, size).dismiss
                                ) {
                                    ended = true;
                                    swipe.value = {
                                        ...swipe.value,
                                        swiping: false,
                                    };
                                    close();
                                    return;
                                }
                                swipe.value = AT_REST;
                            },
                        });
                        // native: Vue's invoker skips events under a fixed test clock
                        const onKeydown = (event: KeyboardEvent) => {
                            if (
                                event.key === "Escape" &&
                                !event.defaultPrevented
                            ) {
                                event.preventDefault();
                                close();
                            }
                        };
                        root.addEventListener("keydown", onKeydown);
                        onCleanup(() => {
                            stopSwipe();
                            root.removeEventListener("keydown", onKeydown);
                            if (!ended) {
                                manager().resume("swipe");
                            }
                        });
                    },
                    { flush: "post", immediate: true },
                );

                provide(ToastRootKey, {
                    toast: () => props.toast,
                    titleId,
                    descriptionId,
                    close,
                });

                return () => {
                    const toast = props.toast;
                    const expanded = viewport?.expanded.value ?? false;
                    const current = swipe.value;
                    const status = presence.status.value;
                    const state: ToastRootState = {
                        type: toast.type,
                        expanded,
                        limited: toast.limited,
                        swiping: current.swiping,
                        swipeDirection: current.direction,
                    };
                    return renderPart(
                        "div",
                        { attrs, slots },
                        props.as,
                        state,
                        {
                            role:
                                toast.priority === "high"
                                    ? "alertdialog"
                                    : "dialog",
                            "aria-modal": "false",
                            "aria-labelledby": titleId.value,
                            "aria-describedby": descriptionId.value,
                            tabindex: 0,
                            inert: toast.limited ? true : undefined,
                            "data-primitives-part": "toast-root",
                            ...stateAttributes({
                                type: toast.type,
                                expanded,
                                limited: toast.limited,
                                swiping: current.swiping,
                                "swipe-direction": current.direction,
                                "starting-style": status === "starting",
                                "ending-style": status === "ending",
                            }),
                            style: {
                                "--toast-index": String(toast.index),
                                "--toast-offset-y": `${toast.offsetY}px`,
                                "--toast-height":
                                    toast.height > 0
                                        ? `${toast.height}px`
                                        : undefined,
                                "--toast-swipe-movement-x": `${current.x}px`,
                                "--toast-swipe-movement-y": `${current.y}px`,
                            },
                            ref: setElement,
                        },
                    );
                };
            },
        }),
    );
