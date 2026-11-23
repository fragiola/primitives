import type { RovingOrientation } from "@fragiola/primitives/collection";
import { useCallback, useContext, useMemo } from "react";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import { useElement } from "../../hooks/use-element.ts";
import { useRovingComposite } from "../../hooks/use-roving-composite.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { RovingContext, scopeOfElement } from "../../utils/roving-context.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { ToggleGroupContext } from "../toggle/toggle-group-context.ts";

export interface ToggleGroupState {
    value: string[];
    disabled: boolean;
    multiple: boolean;
    orientation: RovingOrientation;
}

export interface ToggleGroupProps extends PartProps<ToggleGroupState> {
    /** The values of the pressed toggles (controlled). */
    value?: readonly string[];
    /** The values pressed at first (default `[]`). */
    defaultValue?: readonly string[];
    /** Every change of the pressed values (reason `none`). */
    onValueChange?: (value: string[], details: ChangeDetails) => void;
    /** Several toggles may be pressed (default `false`). */
    multiple?: boolean;
    /** Every toggle is disabled. */
    disabled?: boolean;
    /** The arrow keys' axis (default `"horizontal"`); a Toolbar's inside one. */
    orientation?: RovingOrientation;
    /** The arrows wrap from the last toggle to the first and back (default `true`). */
    loopFocus?: boolean;
}

const NONE: readonly string[] = [];

/**
 * Toggles sharing one value (spec/toggle-group.md, Base UI's ToggleGroup with the APG toolbar's
 * keys): one tab stop, the arrows move the focus. Inside a Toolbar it opens no roving focus of
 * its own: its Toggles are the toolbar's items (spec/toolbar.md, "Nested composites").
 */
export function ToggleGroup({
    value: valueProp,
    defaultValue = NONE,
    onValueChange,
    multiple = false,
    disabled: disabledProp = false,
    orientation: orientationProp = "horizontal",
    loopFocus = true,
    ...props
}: ToggleGroupProps) {
    const [value, setValue] = useControllableState<
        readonly string[],
        ChangeDetails
    >(valueProp, defaultValue, (next, details) =>
        onValueChange?.([...next], details),
    );
    const [element, ref] = useElement<HTMLElement>();
    // a Toolbar's scope around it, unless the group is outside the toolbar's element (in a popup
    // a portal renders from the toolbar: "Nested composites", 6)
    const outer = scopeOfElement(useContext(RovingContext), element);
    const disabled = disabledProp || (outer?.disabled ?? false);
    const orientation = outer?.orientation ?? orientationProp;
    const own = useRovingComposite({
        orientation: orientationProp,
        loopFocus,
        disabled: false,
        root: element,
    });

    const setPressed = useCallback(
        (item: string, pressed: boolean, details: ChangeDetails) => {
            const others = value.filter((entry) => entry !== item);
            const next = pressed
                ? multiple
                    ? [...others, item]
                    : [item]
                : others;
            setValue(next, details);
        },
        [value, multiple, setValue],
    );
    const context = useMemo(
        () => ({ value, disabled, setPressed }),
        [value, disabled, setPressed],
    );
    const state = { value: [...value], disabled, multiple, orientation };
    const rendered = renderElement(
        "div",
        props,
        state,
        {
            role: "group",
            "data-primitives-part": "toggle-group-root",
            ...stateAttributes({ orientation, multiple, disabled }),
            // inside a Toolbar, the toolbar's root handles the keys
            onKeyDown: outer === null ? own.onKeyDown : undefined,
        },
        ref,
    );
    // always one provider (the toolbar's scope passed on, or its own), so the group's element is
    // never remade when it finds out where it is
    return (
        <ToggleGroupContext.Provider value={context}>
            <RovingContext.Provider value={outer ?? own.scope}>
                {rendered}
            </RovingContext.Provider>
        </ToggleGroupContext.Provider>
    );
}
