import {
    type ActivationDirection,
    activationDirection,
} from "@fragiola/primitives/collection";
import {
    computed,
    defineComponent,
    type PropType,
    provide,
    ref,
    shallowRef,
    useId,
    watch,
} from "vue";
import { useControllable } from "../../composables/use-controllable.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { type TabInfo, TabsKey, tabId } from "./tabs-context.ts";

export type { ActivationDirection };

/** spec/tabs.md (`v-model:value`) */
export interface TabsRootState {
    orientation: "horizontal" | "vertical";
    activation: "automatic" | "manual";
    activationDirection: ActivationDirection;
}

export interface TabsRootProps {
    value?: string;
    /** Default: the first enabled tab. */
    defaultValue?: string;
    orientation?: "horizontal" | "vertical";
    /** `automatic`: moving focus selects; `manual`: Enter or Space selects. */
    activation?: "automatic" | "manual";
    /** Whether the arrow keys wrap from the last tab to the first and back (default `true`). */
    loopFocus?: boolean;
}

export type TabsRootEmits = {
    "update:value": (value: string) => true;
    valueChange: (value: string, details: ChangeDetails) => true;
};

export const TabsRoot: PartComponent<
    TabsRootProps,
    TabsRootState,
    TabsRootEmits
> = publicComponent(
    defineComponent({
        name: "TabsRoot",
        inheritAttrs: false,
        props: {
            ...asProp,
            value: { type: String, default: undefined },
            /** Default: the first enabled tab. */
            defaultValue: { type: String, default: undefined },
            orientation: {
                type: String as PropType<"horizontal" | "vertical">,
                default: "horizontal",
            },
            /** `automatic`: moving focus selects; `manual`: Enter or Space selects. */
            activation: {
                type: String as PropType<"automatic" | "manual">,
                default: "automatic",
            },
            /** Whether the arrow keys wrap from the last tab to the first and back. */
            loopFocus: { type: Boolean, default: true },
        },
        emits: {
            "update:value": (_value: string) => true,
            valueChange: (_value: string, _details: ChangeDetails) => true,
        },
        setup(props, { attrs, slots, emit }) {
            const state = useControllable<string | undefined, ChangeDetails>(
                () => props.value,
                props.defaultValue,
                (next, details) => {
                    if (next !== undefined) {
                        emit("update:value", next);
                        emit("valueChange", next, details);
                    }
                },
            );
            const tabs = new Map<HTMLElement, TabInfo>();
            const list = shallowRef<HTMLElement | null>(null);
            const version = ref(0);
            const value = computed(() => state.value.value);
            const baseId = useId();
            // where the new tab sits from the previous one, measured when the value changes (a
            // synchronous watcher: the DOM still shows the previous selection), so the new
            // panel's first render already carries it (spec/tabs.md, `data-activation-direction`)
            const direction = ref<ActivationDirection>("none");
            watch(
                value,
                (next, previous) => {
                    const tab = (current: string | undefined) =>
                        current === undefined
                            ? null
                            : list.value?.ownerDocument.getElementById(
                                  tabId(baseId, current),
                              );
                    direction.value = activationDirection(
                        tab(previous),
                        tab(next),
                        props.orientation,
                    );
                },
                { flush: "sync" },
            );
            provide(TabsKey, {
                value,
                select: (next, reason) => state.set(next, { reason }),
                orientation: () => props.orientation,
                activation: () => props.activation,
                loopFocus: () => props.loopFocus,
                activationDirection: direction,
                baseId,
                tabs,
                list,
                version,
            });
            // no value: the first enabled tab, once the tabs are known
            watch(
                () => [value.value, list.value, version.value] as const,
                ([current, listElement]) => {
                    if (current !== undefined || listElement === null) {
                        return;
                    }
                    const first = [
                        ...listElement.querySelectorAll<HTMLElement>(
                            '[role="tab"]',
                        ),
                    ]
                        .map((element) => tabs.get(element))
                        .find((info) => info !== undefined && !info.disabled);
                    if (first) {
                        state.set(first.value, { reason: "none" });
                    }
                },
                { flush: "post", immediate: true },
            );
            return () =>
                renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    {
                        orientation: props.orientation,
                        activation: props.activation,
                        activationDirection: direction.value,
                    },
                    {
                        "data-primitives-part": "tabs-root",
                        ...stateAttributes({
                            orientation: props.orientation,
                            activation: props.activation,
                            "activation-direction": direction.value,
                        }),
                    },
                );
        },
    }),
);
