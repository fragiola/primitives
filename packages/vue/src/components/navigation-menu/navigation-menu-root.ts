import { activationDirection } from "@fragiola/primitives/collection";
import { createHoverIntent } from "@fragiola/primitives/hover";
import type { Align, Side } from "@fragiola/primitives/positioning";
import {
    computed,
    defineComponent,
    inject,
    onBeforeUnmount,
    type PropType,
    provide,
    ref,
    shallowRef,
    watch,
} from "vue";
import { useControllable } from "../../composables/use-controllable.ts";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { usePresence } from "../../composables/use-presence.ts";
import type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    NavigationMenuContentKey,
    type NavigationMenuContext,
    NavigationMenuKey,
    type NavigationMenuOrientation,
    type OpenedBy,
} from "./navigation-menu-context.ts";

/**
 * A site's navigation (spec/navigation-menu.md, `v-model:value`): the APG disclosure navigation
 * menu, with Base UI's hover, shared popup and nested levels. A `nav`; inside a Content, a nested
 * level (`div`).
 */
export interface NavigationMenuRootState {
    open: boolean;
    orientation: NavigationMenuOrientation;
    nested: boolean;
}

export interface NavigationMenuRootProps {
    /** The open item's value, controlled (`null`: closed). */
    value?: string | null;
    defaultValue?: string | null;
    /** ms before a hover opens (default `50`). */
    delay?: number;
    /** ms before the pointer leaving closes (default `50`). */
    closeDelay?: number;
    orientation?: NavigationMenuOrientation;
    /** The arrow keys wrap at the ends (default `true`). */
    loopFocus?: boolean;
}

export type NavigationMenuRootEmits = {
    "update:value": (value: string | null) => true;
    valueChange: (value: string | null, details: ChangeDetails) => true;
};

export const NavigationMenuRoot: PartComponent<
    NavigationMenuRootProps,
    NavigationMenuRootState,
    NavigationMenuRootEmits
> = publicComponent(
    defineComponent({
        name: "NavigationMenuRoot",
        inheritAttrs: false,
        props: {
            ...asProp,
            value: {
                type: [String, null] as PropType<string | null>,
                default: undefined,
            },
            defaultValue: {
                type: [String, null] as PropType<string | null>,
                default: null,
            },
            delay: { type: Number, default: 50 },
            closeDelay: { type: Number, default: 50 },
            orientation: {
                type: String as PropType<NavigationMenuOrientation>,
                default: "horizontal",
            },
            loopFocus: { type: Boolean, default: true },
        },
        emits: {
            "update:value": (_value: string | null) => true,
            valueChange: (_value: string | null, _details: ChangeDetails) =>
                true,
        },
        setup(props, { attrs, slots, emit }) {
            const nested = inject(NavigationMenuContentKey, false);
            const state = useControllable<string | null, ChangeDetails>(
                () => props.value,
                props.defaultValue,
                (next, details) => {
                    emit("update:value", next);
                    emit("valueChange", next, details);
                },
            );
            const value = computed(() => state.value.value);
            const lastValue = ref<string | null>(value.value);
            watch(
                value,
                (next) => {
                    if (next !== null) {
                        lastValue.value = next;
                    }
                },
                { flush: "sync" },
            );
            const root = shallowRef<HTMLElement | null>(null);
            const triggers = new Map<string, HTMLElement>();
            const version = ref(0);
            const registerTrigger = (item: string, element: HTMLElement) => {
                triggers.set(item, element);
                version.value += 1;
                return () => {
                    if (triggers.get(item) === element) {
                        triggers.delete(item);
                        version.value += 1;
                    }
                };
            };
            const direction =
                ref<NavigationMenuContext["activationDirection"]["value"]>(
                    "none",
                );
            const openedBy: { by: OpenedBy; at: number } = {
                by: "press",
                at: Number.NEGATIVE_INFINITY,
            };
            const lastReason: { current: ChangeReason | null } = {
                current: null,
            };
            const pendingHover = { current: null as string | null };
            const pendingFocus = { current: null as string | null };
            // the value the last setValue asked for: a controlled value that changed without
            // one is a programmatic change
            const requested = {
                current: undefined as string | null | undefined,
            };
            watch(
                value,
                (next) => {
                    if (requested.current !== next) {
                        pendingFocus.current = null;
                        if (next !== null) {
                            openedBy.by = "press";
                            openedBy.at = performance.now();
                        }
                    }
                    requested.current = undefined;
                },
                { flush: "sync" },
            );

            const setValue = (
                next: string | null,
                reason: ChangeReason,
                event?: Event,
                by?: OpenedBy,
            ) => {
                const previous = value.value;
                if (previous === next) {
                    return;
                }
                if (next !== null) {
                    // a programmatic opening (no `by`) is a deliberate one, as a press
                    openedBy.by = by ?? "press";
                    openedBy.at = performance.now();
                }
                // the open key's pending focus belongs to its own change only
                if (reason !== "list-navigation") {
                    pendingFocus.current = null;
                }
                requested.current = next;
                // the direction from the Trigger open before (none from closed)
                direction.value =
                    previous !== null && next !== null
                        ? activationDirection(
                              triggers.get(previous),
                              triggers.get(next),
                              props.orientation,
                          )
                        : "none";
                lastReason.current = reason;
                state.set(next, { reason, event });
            };
            const hover = createHoverIntent({
                open: () => {
                    const item = pendingHover.current;
                    if (item !== null) {
                        setValue(item, "trigger-hover", undefined, "hover");
                    }
                },
                close: () => setValue(null, "trigger-hover"),
            });
            onBeforeUnmount(() => hover.cancel());

            const popup = shallowRef<HTMLElement | null>(null);
            const open = computed(() => value.value !== null);
            const presence = usePresence(open, () => popup.value);
            const size = ref<{ width: number; height: number } | null>(null);
            const activeTrigger = computed(() => {
                void version.value;
                const shown = value.value ?? lastValue.value;
                return shown === null ? null : (triggers.get(shown) ?? null);
            });
            const context: NavigationMenuContext = {
                value,
                lastValue,
                setValue,
                openedBy,
                lastReason,
                orientation: () => props.orientation,
                loopFocus: () => props.loopFocus,
                delay: () => props.delay,
                closeDelay: () => props.closeDelay,
                hover,
                pendingHover,
                pendingFocus,
                nested,
                root,
                triggers,
                registerTrigger,
                activeTrigger,
                activationDirection: direction,
                positioner: shallowRef(null),
                popup,
                viewport: shallowRef(null),
                arrow: shallowRef(null),
                placed: ref<{ side: Side; align: Align }>({
                    side: "bottom",
                    align: "center",
                }),
                size,
                setSize: (next) => {
                    if (
                        size.value?.width !== next.width ||
                        size.value.height !== next.height
                    ) {
                        size.value = next;
                    }
                },
                layered: ref(false),
                presence: {
                    mounted: presence.mounted,
                    status: presence.status,
                },
            };
            provide(NavigationMenuKey, context);
            const setRoot = elementSetter(root);
            return () => {
                const orientation = props.orientation;
                return renderPart(
                    nested ? "div" : "nav",
                    { attrs, slots },
                    props.as,
                    { open: open.value, orientation, nested },
                    {
                        "data-primitives-part": "navigation-menu-root",
                        ...stateAttributes({ orientation }),
                        ref: setRoot,
                    },
                );
            };
        },
    }),
);
