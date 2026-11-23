import type { RovingOrientation } from "@fragiola/primitives/collection";
import { useMemo } from "react";
import { useRovingComposite } from "../../hooks/use-roving-composite.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { RovingContext } from "../../utils/roving-context.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { ToolbarContext } from "./toolbar-context.ts";

export interface ToolbarRootState {
    orientation: RovingOrientation;
    disabled: boolean;
}

export interface ToolbarRootProps extends PartProps<ToolbarRootState> {
    /** The arrow keys' axis (default `"horizontal"`). */
    orientation?: RovingOrientation;
    /** The arrows wrap from the last item to the first and back (default `true`). */
    loopFocus?: boolean;
    /** Every Button, Input, Toggle and ToggleGroup in it is disabled. */
    disabled?: boolean;
}

/**
 * A set of controls that is one tab stop (spec/toolbar.md, the APG toolbar): the roving-focus
 * scope every item inside registers with, a ToggleGroup's Toggles included ("Nested composites").
 */
export function ToolbarRoot({
    orientation = "horizontal",
    loopFocus = true,
    disabled = false,
    ...props
}: ToolbarRootProps) {
    const { scope, onKeyDown } = useRovingComposite({
        orientation,
        loopFocus,
        disabled,
    });
    const context = useMemo(() => ({ orientation }), [orientation]);
    const state = { orientation, disabled };
    return (
        <ToolbarContext.Provider value={context}>
            <RovingContext.Provider value={scope}>
                {renderElement("div", props, state, {
                    role: "toolbar",
                    "aria-orientation": orientation,
                    "data-primitives-part": "toolbar-root",
                    ...stateAttributes({ orientation, disabled }),
                    onKeyDown,
                })}
            </RovingContext.Provider>
        </ToolbarContext.Provider>
    );
}
