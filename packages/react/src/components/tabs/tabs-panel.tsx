import { useElement } from "../../hooks/use-element.ts";
import { usePresence } from "../../hooks/use-presence.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { panelId, TabsContext, tabId } from "./tabs-context.ts";
import type { ActivationDirection } from "./tabs-root.tsx";

export interface TabsPanelState {
    selected: boolean;
    orientation: string;
    activationDirection: ActivationDirection;
    transitionStatus: "starting" | "ending" | undefined;
}

export interface TabsPanelProps extends PartProps<TabsPanelState> {
    value: string;
    /** Keep an inactive panel rendered, `hidden`, once its exit ended (default `false`). */
    keepMounted?: boolean;
}

/**
 * The content of one tab, with enter and exit states (spec/tabs.md, "Animation"): a panel that
 * stops being selected stays, `inert`, with `data-ending-style` until its animations end.
 */
export function TabsPanel({
    value,
    keepMounted = false,
    ...props
}: TabsPanelProps) {
    const context = useRequiredContext(TabsContext, "Tabs.Panel");
    const selected = context.value === value;
    const [element, ref] = useElement<HTMLElement>();
    const { mounted, status } = usePresence(selected, () => element, {
        enterOnMount: false,
    });
    if (!mounted && !keepMounted) {
        return null;
    }
    const exiting = !selected && mounted;
    const state = {
        selected,
        orientation: context.orientation,
        activationDirection: context.activationDirection,
        transitionStatus: status,
    };
    return renderElement(
        "div",
        props,
        state,
        {
            role: "tabpanel",
            id: panelId(context.baseId, value),
            "aria-labelledby": tabId(context.baseId, value),
            tabIndex: 0,
            hidden: !mounted,
            inert: exiting || undefined,
            "data-primitives-part": "tabs-panel",
            ...stateAttributes({
                selected,
                orientation: context.orientation,
                "activation-direction": context.activationDirection,
                "starting-style": status === "starting",
                "ending-style": status === "ending",
            }),
        },
        ref,
    );
}
