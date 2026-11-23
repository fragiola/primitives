import type {
    FocusEvent,
    FocusEventHandler,
    KeyboardEventHandler,
    MouseEvent,
    MouseEventHandler,
    PointerEventHandler,
} from "react";
import { useContext } from "react";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import { useRovingItem } from "../../hooks/use-roving-item.ts";
import { buttonProps } from "../../utils/button-props.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { ToggleGroupContext } from "./toggle-group-context.ts";

export interface ToggleState {
    pressed: boolean;
    disabled: boolean;
}

export interface ToggleProps extends PartProps<ToggleState> {
    /** Whether it is pressed (controlled); ignored inside a ToggleGroup. */
    pressed?: boolean;
    /** Pressed at first (default `false`); ignored inside a ToggleGroup. */
    defaultPressed?: boolean;
    /** Every press, before a group's `onValueChange` (reason `none`). */
    onPressedChange?: (pressed: boolean, details: ChangeDetails) => void;
    /** Its value in a ToggleGroup (required there). */
    value?: string;
    /** It ignores presses and keys. */
    disabled?: boolean;
    /**
     * Whether the rendered element is a native `<button>` (default `true`). `false` when `render`
     * gives another element: the Toggle adds `role="button"`, the tab order and the keys.
     */
    nativeButton?: boolean;
    onClick?: MouseEventHandler<HTMLElement>;
    onMouseDown?: MouseEventHandler<HTMLElement>;
    onPointerDown?: PointerEventHandler<HTMLElement>;
    onKeyDown?: KeyboardEventHandler<HTMLElement>;
    onKeyUp?: KeyboardEventHandler<HTMLElement>;
    onFocus?: FocusEventHandler<HTMLElement>;
}

/**
 * A two-state button (spec/toggle.md, the APG's toggle button): `aria-pressed`, Button's
 * behaviour, one of a ToggleGroup's values inside one, and an item of the nearest roving-focus
 * scope (a ToggleGroup's, a Toolbar's) inside one.
 */
export function Toggle({
    pressed: pressedProp,
    defaultPressed = false,
    onPressedChange,
    value,
    disabled: disabledProp = false,
    nativeButton = true,
    onClick,
    onMouseDown,
    onPointerDown,
    onKeyDown,
    onKeyUp,
    onFocus,
    ...props
}: ToggleProps) {
    const group = useContext(ToggleGroupContext);
    const [own, setOwn] = useControllableState(
        pressedProp,
        defaultPressed,
        group === null ? onPressedChange : undefined,
    );
    const pressed =
        group === null
            ? own
            : value !== undefined && group.value.includes(value);
    const ownDisabled = disabledProp || (group?.disabled ?? false);
    // a disabled Toggle is natively disabled: it cannot take focus (Base UI)
    const item = useRovingItem(
        (scopeDisabled) => !(ownDisabled || scopeDisabled),
    );
    const disabled = ownDisabled || (item.scope?.disabled ?? false);

    const press = (event: MouseEvent<HTMLElement>) => {
        const next = !pressed;
        const details: ChangeDetails = {
            reason: "none",
            event: event.nativeEvent,
        };
        if (group === null) {
            setOwn(next, details);
        } else {
            onPressedChange?.(next, details);
            if (value !== undefined) {
                group.setPressed(value, next, details);
            }
        }
        onClick?.(event);
    };
    const state = { pressed, disabled };
    return renderElement(
        "button",
        props,
        state,
        {
            ...buttonProps({
                disabled,
                focusableWhenDisabled: false,
                nativeButton,
                // a Toggle never submits a form
                type: nativeButton ? "button" : undefined,
                tabIndex: item.tabIndex,
                composite: item.scope !== null,
                onClick: press,
                onMouseDown,
                onPointerDown,
                onKeyDown,
                onKeyUp,
            }),
            "aria-pressed": pressed ? "true" : "false",
            "data-primitives-part": "toggle-root",
            ...stateAttributes({ pressed, disabled }),
            onFocus: (event: FocusEvent<HTMLElement>) => {
                item.onFocus();
                onFocus?.(event);
            },
        },
        item.ref,
    );
}
