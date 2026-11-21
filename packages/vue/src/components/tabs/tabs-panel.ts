import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { panelId, TabsKey, tabId } from "./tabs-context.ts";

export interface TabsPanelState {
    selected: boolean;
    orientation: "horizontal" | "vertical";
}

export interface TabsPanelProps {
    value: string;
    /** Keep an inactive panel rendered, `hidden` (default `false`). */
    keepMounted?: boolean;
}

export const TabsPanel: PartComponent<TabsPanelProps, TabsPanelState> =
    publicComponent(
        defineComponent({
            name: "TabsPanel",
            inheritAttrs: false,
            props: {
                ...asProp,
                value: { type: String, required: true },
                /** Keep an inactive panel rendered, `hidden` (default `false`). */
                keepMounted: { type: Boolean, default: false },
            },
            setup(props, { attrs, slots }) {
                const context = useRequiredContext(TabsKey, "Tabs.Panel");
                return () => {
                    const selected = context.value.value === props.value;
                    if (!selected && !props.keepMounted) {
                        return null;
                    }
                    const orientation = context.orientation();
                    return renderPart(
                        "div",
                        { attrs, slots },
                        props.as,
                        { selected, orientation },
                        {
                            role: "tabpanel",
                            id: panelId(context.baseId, props.value),
                            "aria-labelledby": tabId(
                                context.baseId,
                                props.value,
                            ),
                            tabindex: 0,
                            hidden: !selected,
                            "data-primitives-part": "tabs-panel",
                            ...stateAttributes({ selected, orientation }),
                        },
                    );
                };
            },
        }),
    );
