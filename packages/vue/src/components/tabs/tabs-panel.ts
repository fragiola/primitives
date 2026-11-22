import { computed, defineComponent, shallowRef } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import {
    type TransitionStatus,
    usePresence,
} from "../../composables/use-presence.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { panelId, TabsKey, tabId } from "./tabs-context.ts";
import type { ActivationDirection } from "./tabs-root.ts";

export interface TabsPanelState {
    selected: boolean;
    orientation: "horizontal" | "vertical";
    activationDirection: ActivationDirection;
    transitionStatus: TransitionStatus;
}

export interface TabsPanelProps {
    value: string;
    /** Keep an inactive panel rendered, `hidden`, once its exit ended (default `false`). */
    keepMounted?: boolean;
}

/**
 * The content of one tab, with enter and exit states (spec/tabs.md, "Animation"): a panel that
 * stops being selected stays, `inert`, with `data-ending-style` until its animations end.
 */
export const TabsPanel: PartComponent<TabsPanelProps, TabsPanelState> =
    publicComponent(
        defineComponent({
            name: "TabsPanel",
            inheritAttrs: false,
            props: {
                ...asProp,
                value: { type: String, required: true },
                /** Keep an inactive panel rendered, `hidden`, once its exit ended. */
                keepMounted: { type: Boolean, default: false },
            },
            setup(props, { attrs, slots }) {
                const context = useRequiredContext(TabsKey, "Tabs.Panel");
                const element = shallowRef<HTMLElement | null>(null);
                const setElement = elementSetter(element);
                const selected = computed(
                    () => context.value.value === props.value,
                );
                const presence = usePresence(selected, () => element.value, {
                    enterOnMount: false,
                });
                return () => {
                    const isSelected = selected.value;
                    const mounted = presence.mounted.value;
                    if (!mounted && !props.keepMounted) {
                        return null;
                    }
                    const status = presence.status.value;
                    const orientation = context.orientation();
                    const activationDirection =
                        context.activationDirection.value;
                    return renderPart(
                        "div",
                        { attrs, slots },
                        props.as,
                        {
                            selected: isSelected,
                            orientation,
                            activationDirection,
                            transitionStatus: status,
                        },
                        {
                            role: "tabpanel",
                            id: panelId(context.baseId, props.value),
                            "aria-labelledby": tabId(
                                context.baseId,
                                props.value,
                            ),
                            tabindex: 0,
                            hidden: !mounted,
                            inert: (!isSelected && mounted) || undefined,
                            "data-primitives-part": "tabs-panel",
                            ...stateAttributes({
                                selected: isSelected,
                                orientation,
                                "activation-direction": activationDirection,
                                "starting-style": status === "starting",
                                "ending-style": status === "ending",
                            }),
                            ref: setElement,
                        },
                    );
                };
            },
        }),
    );
