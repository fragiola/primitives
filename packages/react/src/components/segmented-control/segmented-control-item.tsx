import {
    type KeyboardEvent,
    type MouseEvent,
    useLayoutEffect,
    useMemo,
} from "react";
import { useElement } from "../../hooks/use-element.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    SegmentedControlContext,
    SegmentedControlItemContext,
    type SegmentedControlItemState,
} from "./segmented-control-context.ts";

export type { SegmentedControlItemState } from "./segmented-control-context.ts";

export interface SegmentedControlItemProps
    extends PartProps<SegmentedControlItemState> {
    /** Its value in the control. */
    value: string;
    disabled?: boolean;
    id?: string;
}

/** A segment: a `radio` of the control (spec/segmented-control.md). */
export function SegmentedControlItem({
    value,
    disabled: disabledProp = false,
    ...props
}: SegmentedControlItemProps) {
    const control = useRequiredContext(
        SegmentedControlContext,
        "SegmentedControl.Item",
    );
    const [element, ref] = useElement<HTMLElement>();
    const disabled = disabledProp || control.disabled;
    const checked = control.value === value;
    const { register, orientation } = control;
    useLayoutEffect(
        () =>
            element === null
                ? undefined
                : register({ value, disabled, element }),
        [register, value, disabled, element],
    );

    const state = useMemo(
        () => ({ checked, disabled, orientation }),
        [checked, disabled, orientation],
    );
    return (
        <SegmentedControlItemContext.Provider value={state}>
            {renderElement(
                "button",
                props,
                state,
                {
                    type: "button",
                    role: "radio",
                    disabled,
                    "aria-checked": checked ? "true" : "false",
                    tabIndex: control.tabStop === value && !disabled ? 0 : -1,
                    "data-primitives-part": "segmented-control-item",
                    ...stateAttributes({
                        checked,
                        unchecked: !checked,
                        disabled,
                        orientation,
                    }),
                    onClick: (event: MouseEvent<HTMLElement>) => {
                        if (disabled) {
                            return;
                        }
                        // a press (or a press on its label) checks and focuses it
                        event.currentTarget.focus();
                        control.select(value, "item-press", event.nativeEvent);
                    },
                    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
                        // a native radio does not check on Enter (a button would click)
                        if (event.key === "Enter") {
                            event.preventDefault();
                            return;
                        }
                        // Space checks it here, as a key: its click on key up is prevented
                        if (event.key === " ") {
                            event.preventDefault();
                            if (!disabled) {
                                control.select(
                                    value,
                                    "keyboard",
                                    event.nativeEvent,
                                );
                            }
                            return;
                        }
                        if (
                            control.navigate(
                                event.key,
                                event.currentTarget,
                                event.nativeEvent,
                            )
                        ) {
                            event.preventDefault();
                        }
                    },
                    onKeyUp: (event: KeyboardEvent<HTMLElement>) => {
                        if (event.key === " ") {
                            event.preventDefault();
                        }
                    },
                },
                ref,
            )}
        </SegmentedControlItemContext.Provider>
    );
}
