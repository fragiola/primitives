import {
    type ResolvedSnapPoint,
    resolveSnapPoints,
    swipeMovement,
    swipeProgress,
    swipeRelease,
    watchSwipe,
} from "@fragiola/primitives/swipe";
import {
    computed,
    defineComponent,
    h,
    mergeProps,
    type PropType,
    shallowRef,
    type VNode,
    watch,
} from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import type { FocusTarget } from "../../utils/change-details.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, type RenderSlotProps } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { DialogKey } from "../dialog/dialog-context.ts";
import { DialogPopup, type DialogPopupProps } from "../dialog/dialog-popup.ts";
import { DrawerKey } from "./drawer-context.ts";

export interface DrawerPopupState {
    open: boolean;
    nested: boolean;
    nestedDrawerOpen: boolean;
    swiping: boolean;
    swipeDirection: string;
    expanded: boolean;
}

export type DrawerPopupProps = DialogPopupProps;

interface Sizes {
    popupHeight: number;
    popupWidth: number;
    viewportHeight: number;
    rootFontSize: number;
}

/**
 * The drawer's dialog (spec/drawer.md): Dialog's Popup, plus the swipe (`watchSwipe` on it), the
 * snap point offset and the movement variables.
 */
export const DrawerPopup: PartComponent<DrawerPopupProps, DrawerPopupState> =
    publicComponent(
        defineComponent({
            name: "DrawerPopup",
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
                const dialog = useRequiredContext(DialogKey, "Drawer.Popup");
                const drawer = useRequiredContext(DrawerKey, "Drawer.Popup");
                const movement = shallowRef({ x: 0, y: 0 });
                const swiping = shallowRef(false);
                const dismissed = shallowRef(false);
                const sizes = shallowRef<Sizes>({
                    popupHeight: 0,
                    popupWidth: 0,
                    viewportHeight: 0,
                    rootFontSize: 16,
                });
                const vertical = computed(
                    () =>
                        drawer.swipeDirection.value === "up" ||
                        drawer.swipeDirection.value === "down",
                );

                // the sizes the snap points are measured against, while it is shown
                watch(
                    () =>
                        [
                            dialog.open.value,
                            dialog.popup.value,
                            dialog.viewport.value,
                        ] as const,
                    ([open, popup, viewport], _, onCleanup) => {
                        if (!open || popup === null) {
                            return;
                        }
                        const doc = popup.ownerDocument;
                        const measure = () => {
                            const fontSize = Number.parseFloat(
                                doc.defaultView?.getComputedStyle(
                                    doc.documentElement,
                                ).fontSize ?? "",
                            );
                            const next = {
                                popupHeight: popup.offsetHeight,
                                popupWidth: popup.offsetWidth,
                                viewportHeight:
                                    viewport?.offsetHeight ||
                                    doc.documentElement.clientHeight,
                                rootFontSize: Number.isFinite(fontSize)
                                    ? fontSize
                                    : 16,
                            };
                            const previous = sizes.value;
                            if (
                                previous.popupHeight !== next.popupHeight ||
                                previous.popupWidth !== next.popupWidth ||
                                previous.viewportHeight !==
                                    next.viewportHeight ||
                                previous.rootFontSize !== next.rootFontSize
                            ) {
                                sizes.value = next;
                            }
                        };
                        measure();
                        const Observer = doc.defaultView?.ResizeObserver;
                        if (Observer === undefined) {
                            return;
                        }
                        const observer = new Observer(measure);
                        observer.observe(popup);
                        if (viewport) {
                            observer.observe(viewport);
                        }
                        onCleanup(() => observer.disconnect());
                    },
                    { flush: "post", immediate: true },
                );

                const points = computed<ResolvedSnapPoint[]>(() => {
                    const snapPoints = drawer.snapPoints.value;
                    return snapPoints === undefined || !vertical.value
                        ? []
                        : resolveSnapPoints(snapPoints, sizes.value);
                });
                const offset = computed(() => {
                    const active =
                        points.value.find((point) =>
                            Object.is(point.value, drawer.snapPoint.value),
                        ) ?? points.value[0];
                    return active?.offset ?? 0;
                });

                // an opening starts at rest
                watch(
                    () => dialog.open.value,
                    (open) => {
                        if (open) {
                            movement.value = { x: 0, y: 0 };
                            swiping.value = false;
                            dismissed.value = false;
                        }
                    },
                    { flush: "sync" },
                );

                watch(
                    () =>
                        [
                            dialog.open.value,
                            dialog.popup.value,
                            drawer.swipeDirection.value,
                        ] as const,
                    ([open, popup, direction], _, onCleanup) => {
                        if (!open || popup === null) {
                            return;
                        }
                        const size = () =>
                            vertical.value
                                ? sizes.value.popupHeight || popup.offsetHeight
                                : sizes.value.popupWidth || popup.offsetWidth;
                        const settle = () => {
                            swiping.value = false;
                            movement.value = { x: 0, y: 0 };
                            drawer.swipe.value = {
                                swiping: false,
                                progress: 0,
                            };
                        };
                        const stop = watchSwipe(popup, {
                            directions: [direction],
                            // the mouse selects the Content's text (spec/drawer.md, "Swipe")
                            canStart: (target, event) =>
                                event.pointerType !== "mouse" ||
                                target.closest(
                                    '[data-primitives-part="drawer-content"]',
                                ) === null,
                            onStart: () => {
                                swiping.value = true;
                            },
                            onMove: (move) => {
                                const base = offset.value;
                                movement.value = swipeMovement(
                                    direction,
                                    move,
                                    base,
                                );
                                drawer.swipe.value = {
                                    swiping: true,
                                    progress: swipeProgress(
                                        direction,
                                        move,
                                        size(),
                                        base,
                                    ),
                                };
                            },
                            onEnd: (end, event) => {
                                if (end === null) {
                                    settle();
                                    return;
                                }
                                const outcome = swipeRelease(
                                    direction,
                                    end,
                                    size(),
                                    points.value.length > 0
                                        ? {
                                              points: points.value,
                                              currentOffset: offset.value,
                                          }
                                        : undefined,
                                );
                                if (outcome.dismiss) {
                                    swiping.value = false;
                                    dismissed.value = true;
                                    drawer.swipe.value = {
                                        swiping: false,
                                        progress: 1,
                                    };
                                    if (
                                        !dialog.setOpen(
                                            false,
                                            "swipe",
                                            event ?? undefined,
                                        )
                                    ) {
                                        dismissed.value = false;
                                        settle();
                                    }
                                    return;
                                }
                                if (outcome.snapPoint !== null) {
                                    const point =
                                        points.value[outcome.snapPoint];
                                    if (point !== undefined) {
                                        drawer.setSnapPoint(point.value, {
                                            reason: "swipe",
                                            event: event ?? undefined,
                                        });
                                    }
                                }
                                settle();
                            },
                        });
                        onCleanup(stop);
                    },
                    { flush: "post", immediate: true },
                );

                return () => {
                    const open = dialog.open.value;
                    const direction = drawer.swipeDirection.value;
                    const expanded = offset.value === 0;
                    const state: DrawerPopupState = {
                        open,
                        nested: dialog.nested,
                        nestedDrawerOpen: dialog.nestedDialogs.value > 0,
                        swiping: swiping.value,
                        swipeDirection: direction,
                        expanded,
                    };
                    const sign = direction === "up" ? -1 : 1;
                    const internal = {
                        style: {
                            "--drawer-swipe-movement-x": `${movement.value.x}px`,
                            "--drawer-swipe-movement-y": `${movement.value.y}px`,
                            "--drawer-snap-point-offset": `${offset.value * sign}px`,
                            "--drawer-swipe-progress":
                                drawer.swipe.value.progress,
                        },
                        ...stateAttributes({
                            "swipe-direction": direction,
                            swiping: swiping.value,
                            "swipe-dismiss": dismissed.value && !open,
                            expanded,
                        }),
                    };
                    const render = slots.render;
                    return h(
                        DialogPopup,
                        mergeProps(internal, attrs, {
                            as: props.as,
                            initialFocus: props.initialFocus,
                            finalFocus: props.finalFocus,
                        }),
                        {
                            default: () => slots.default?.({ state }),
                            ...(render
                                ? {
                                      render: (
                                          scope: RenderSlotProps<unknown>,
                                      ): VNode[] => render({ ...scope, state }),
                                  }
                                : {}),
                        },
                    );
                };
            },
        }),
    );
