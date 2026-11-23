import type {
    FocusEvent,
    FocusEventHandler,
    KeyboardEventHandler,
    MouseEventHandler,
    PointerEventHandler,
} from "react";
import { useContext } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { useRovingItem } from "../../hooks/use-roving-item.ts";
import { buttonProps } from "../../utils/button-props.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { RovingContext } from "../../utils/roving-context.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { ToolbarContext, type ToolbarItemState } from "./toolbar-context.ts";

export interface ToolbarButtonProps extends PartProps<ToolbarItemState> {
    /** The button ignores presses and keys. */
    disabled?: boolean;
    /** A disabled button the arrows still reach (spec/toolbar.md, "Disabled items"). */
    focusableWhenDisabled?: boolean;
    /** Whether the rendered element is a native `<button>` (default `true`), as Button's. */
    nativeButton?: boolean;
    /** Forwarded; a native button is `type="button"` unless given. */
    type?: "button" | "submit" | "reset";
    onClick?: MouseEventHandler<HTMLElement>;
    onMouseDown?: MouseEventHandler<HTMLElement>;
    onPointerDown?: PointerEventHandler<HTMLElement>;
    onKeyDown?: KeyboardEventHandler<HTMLElement>;
    onKeyUp?: KeyboardEventHandler<HTMLElement>;
    onFocus?: FocusEventHandler<HTMLElement>;
}

/** A button of a toolbar (spec/toolbar.md): Button's behaviour, an item of the toolbar's focus. */
export function ToolbarButton({
    disabled: disabledProp = false,
    focusableWhenDisabled = false,
    nativeButton = true,
    type,
    onClick,
    onMouseDown,
    onPointerDown,
    onKeyDown,
    onKeyUp,
    onFocus,
    ...props
}: ToolbarButtonProps) {
    const { orientation } = useRequiredContext(
        ToolbarContext,
        "Toolbar.Button",
    );
    const scope = useContext(RovingContext);
    const disabled = disabledProp || (scope?.disabled ?? false);
    const item = useRovingItem(!disabled || focusableWhenDisabled);
    const state = { orientation, disabled };
    return renderElement(
        "button",
        props,
        state,
        {
            ...buttonProps({
                disabled,
                focusableWhenDisabled,
                nativeButton,
                type,
                tabIndex: item?.tabIndex,
                composite: true,
                onClick,
                onMouseDown,
                onPointerDown,
                onKeyDown,
                onKeyUp,
            }),
            "data-primitives-part": "toolbar-button",
            ...stateAttributes({ orientation, disabled }),
            onFocus: (event: FocusEvent<HTMLElement>) => {
                item?.onFocus();
                onFocus?.(event);
            },
        },
        item?.ref,
    );
}
