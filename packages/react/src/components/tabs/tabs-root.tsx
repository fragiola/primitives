import {
    type ActivationDirection,
    activationDirection,
} from "@fragiola/primitives/collection";
import {
    useCallback,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { type TabInfo, TabsContext, tabId } from "./tabs-context.ts";

export type { ActivationDirection };

export interface TabsRootState {
    orientation: "horizontal" | "vertical";
    activation: "automatic" | "manual";
    activationDirection: ActivationDirection;
}

export interface TabsRootProps extends PartProps<TabsRootState> {
    value?: string;
    /** Default: the first enabled tab. */
    defaultValue?: string;
    onValueChange?: (value: string, details: ChangeDetails) => void;
    orientation?: "horizontal" | "vertical";
    /** `automatic`: moving focus selects; `manual`: Enter or Space selects. */
    activation?: "automatic" | "manual";
    /** Whether the arrow keys wrap from the last tab to the first and back (default `true`). */
    loopFocus?: boolean;
}

/** spec/tabs.md */
export function TabsRoot({
    value: valueProp,
    defaultValue,
    onValueChange,
    orientation = "horizontal",
    activation = "automatic",
    loopFocus = true,
    ...props
}: TabsRootProps) {
    const [value, setValue] = useControllableState<
        string | undefined,
        ChangeDetails
    >(
        valueProp,
        defaultValue,
        onValueChange as
            | ((value: string | undefined, details: ChangeDetails) => void)
            | undefined,
    );
    const baseId = useId();
    const tabs = useMemo(() => new Map<HTMLElement, TabInfo>(), []);
    const [list, setList] = useState<HTMLElement | null>(null);
    const [version, setVersion] = useState(0);
    const bump = useCallback(() => setVersion((current) => current + 1), []);
    // where the new tab sits from the previous one, measured in the render that selects it, so the
    // new panel's first frame already carries it (spec/tabs.md, `data-activation-direction`)
    const activated = useRef<{
        value: string | undefined;
        direction: ActivationDirection;
    }>({ value, direction: "none" });
    if (activated.current.value !== value) {
        const previous = activated.current.value;
        const tab = (current: string | undefined) =>
            current === undefined
                ? null
                : list?.ownerDocument.getElementById(tabId(baseId, current));
        activated.current = {
            value,
            direction: activationDirection(
                tab(previous),
                tab(value),
                orientation,
            ),
        };
    }
    const direction = activated.current.direction;
    const select = useCallback(
        (next: string, reason: ChangeReason) => setValue(next, { reason }),
        [setValue],
    );

    // no value: the first enabled tab, once the tabs are known
    // biome-ignore lint/correctness/useExhaustiveDependencies: `version` re-runs it when tabs register
    useLayoutEffect(() => {
        if (value !== undefined || list === null) {
            return;
        }
        const first = [...list.querySelectorAll<HTMLElement>('[role="tab"]')]
            .map((element) => tabs.get(element))
            .find((info) => info !== undefined && !info.disabled);
        if (first) {
            setValue(first.value, { reason: "none" });
        }
    }, [value, list, tabs, setValue, version]);

    const context = useMemo(
        () => ({
            value,
            select,
            orientation,
            activation,
            loopFocus,
            activationDirection: direction,
            baseId,
            tabs,
            list,
            setList,
            version,
            bump,
        }),
        [
            value,
            select,
            orientation,
            activation,
            loopFocus,
            direction,
            baseId,
            tabs,
            list,
            version,
            bump,
        ],
    );
    const state = { orientation, activation, activationDirection: direction };
    return (
        <TabsContext.Provider value={context}>
            {renderElement("div", props, state, {
                "data-primitives-part": "tabs-root",
                ...stateAttributes({
                    orientation,
                    activation,
                    "activation-direction": direction,
                }),
            })}
        </TabsContext.Provider>
    );
}
