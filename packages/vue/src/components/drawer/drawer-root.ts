import type { SnapPoint, SwipeDirection } from "@fragiola/primitives/swipe";
import {
    computed,
    defineComponent,
    type PropType,
    provide,
    shallowRef,
} from "vue";
import { useControllable } from "../../composables/use-controllable.ts";
import {
    type OverlayRootEmits,
    type OverlayRootProps,
    type OverlayTriggerRootProps,
    overlayRootEmits,
} from "../../composables/use-overlay-root.ts";
import type {
    ChangeDetails,
    OpenChangeDetails,
} from "../../utils/change-details.ts";
import {
    type OverlayRootSlots,
    type PublicComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import {
    dialogRootProps,
    setupDialogRoot,
} from "../dialog/dialog-root-base.ts";
import { type DrawerContext, DrawerKey } from "./drawer-context.ts";
import type { DrawerHandle } from "./drawer-handle.ts";

/**
 * Holds the drawer's state (`v-model:open`, `v-model:snap-point`); renders no element
 * (spec/drawer.md). Its parts are Dialog's, named `drawer-*`, plus the swipe and the snap points. A
 * template ref on it exposes the actions, `close()` and `unmount()`.
 */
export interface DrawerRootProps
    extends OverlayRootProps,
        OverlayTriggerRootProps {
    /** Connects Triggers rendered outside the Root (spec/drawer.md, "Detached triggers"). */
    handle?: DrawerHandle;
    /** The edge a swipe dismisses it towards (default `"down"`: a bottom sheet). */
    swipeDirection?: SwipeDirection;
    /** The heights it rests at (spec/drawer.md, "Snap points"); vertical directions only. */
    snapPoints?: readonly SnapPoint[];
    /** The active snap point (`v-model:snap-point`). */
    snapPoint?: SnapPoint | null;
    /** The snap point it opens on, uncontrolled (default: the first of `snapPoints`). */
    defaultSnapPoint?: SnapPoint | null;
}

/** Dialog's events, plus `update:snapPoint` and `@snap-point-change="(point, details) => ..."`. */
export type DrawerRootEmits = OverlayRootEmits & {
    "update:snapPoint": (snapPoint: SnapPoint | null) => true;
    snapPointChange: (
        snapPoint: SnapPoint | null,
        details: ChangeDetails,
    ) => true;
};

export const DrawerRoot: PublicComponent<
    DrawerRootProps,
    OverlayRootSlots,
    DrawerRootEmits
> = publicComponent(
    defineComponent({
        name: "DrawerRoot",
        props: {
            ...dialogRootProps,
            handle: {
                type: Object as PropType<DrawerHandle>,
                default: undefined,
            },
            swipeDirection: {
                type: String as PropType<SwipeDirection>,
                default: "down",
            },
            snapPoints: {
                type: Array as PropType<readonly SnapPoint[]>,
                default: undefined,
            },
            snapPoint: {
                type: [String, Number, null] as PropType<SnapPoint | null>,
                default: undefined,
            },
            defaultSnapPoint: {
                type: [String, Number, null] as PropType<SnapPoint | null>,
                default: undefined,
            },
        },
        emits: {
            ...overlayRootEmits,
            "update:snapPoint": (_snapPoint: SnapPoint | null) => true,
            snapPointChange: (
                _snapPoint: SnapPoint | null,
                _details: ChangeDetails,
            ) => true,
        },
        setup(props, { emit, slots, expose }) {
            const initial = () =>
                props.defaultSnapPoint ?? props.snapPoints?.[0] ?? null;
            const state = useControllable<SnapPoint | null, ChangeDetails>(
                () => props.snapPoint,
                initial(),
                (next, details) => {
                    emit("update:snapPoint", next);
                    emit("snapPointChange", next, details);
                },
            );
            const swipe = shallowRef({ swiping: false, progress: 0 });
            const context: DrawerContext = {
                swipeDirection: computed(() => props.swipeDirection),
                snapPoints: computed(() => props.snapPoints),
                snapPoint: computed(() =>
                    props.snapPoints === undefined ? null : state.value.value,
                ),
                setSnapPoint: state.set,
                swipe,
            };
            provide(DrawerKey, context);
            // an opening starts on the default snap point again (spec/drawer.md, "API")
            const overlayEmit = ((event: string, ...args: unknown[]) => {
                (emit as (event: string, ...args: unknown[]) => void)(
                    event,
                    ...args,
                );
                if (event !== "openChange") {
                    return;
                }
                const [next, details] = args as [boolean, OpenChangeDetails];
                if (details.isCanceled) {
                    return;
                }
                swipe.value = { swiping: false, progress: 0 };
                const start = initial();
                if (next && !Object.is(start, state.value.value)) {
                    state.set(start, { reason: "none" });
                }
            }) as Parameters<typeof setupDialogRoot>[2]["emit"];
            return setupDialogRoot("drawer", props, {
                emit: overlayEmit,
                slots,
                expose,
            });
        },
    }),
);
