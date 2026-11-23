import type { MouseEvent, PointerEvent } from "react";
import { useContext } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { useRovingItem } from "../../hooks/use-roving-item.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { RovingContext } from "../../utils/roving-context.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { ToolbarContext, type ToolbarItemState } from "./toolbar-context.ts";

export interface ToolbarInputProps extends PartProps<ToolbarItemState> {
    /** The input ignores presses and typing. */
    disabled?: boolean;
    /** A disabled input the arrows still reach: `aria-disabled` and `readonly` (spec/toolbar.md). */
    focusableWhenDisabled?: boolean;
}

/**
 * A text input of a toolbar (spec/toolbar.md): an item of the toolbar's focus that keeps its caret
 * keys until the caret reaches the text's edge.
 */
export function ToolbarInput({
    disabled: disabledProp = false,
    focusableWhenDisabled = false,
    ...props
}: ToolbarInputProps) {
    const { orientation } = useRequiredContext(ToolbarContext, "Toolbar.Input");
    const scope = useContext(RovingContext);
    const disabled = disabledProp || (scope?.disabled ?? false);
    const focusable = !disabled || focusableWhenDisabled;
    const item = useRovingItem(focusable);
    const preventWhenDisabled = (
        event: MouseEvent<HTMLElement> | PointerEvent<HTMLElement>,
    ) => {
        if (disabled) {
            event.preventDefault();
        }
    };
    return renderElement(
        "input",
        props,
        { orientation, disabled },
        {
            disabled: disabled && !focusableWhenDisabled ? true : undefined,
            "aria-disabled":
                disabled && focusableWhenDisabled ? "true" : undefined,
            readOnly: disabled && focusableWhenDisabled ? true : undefined,
            tabIndex: item?.tabIndex,
            "data-primitives-part": "toolbar-input",
            ...stateAttributes({ orientation, disabled }),
            onClick: preventWhenDisabled,
            onPointerDown: preventWhenDisabled,
            onFocus: item?.onFocus,
        },
        item?.ref,
    );
}
