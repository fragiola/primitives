import type { KeyboardEvent, MouseEvent } from "react";
import { useRef } from "react";
import type { MenuContextValue } from "./menu-context.ts";

/**
 * The activation of a CheckboxItem or a RadioItem (spec/menu.md, "Activating a checkable item"):
 * Space and Enter fire its `click`; the click changes the state, then Enter closes every level,
 * Space keeps them open, and a pointer click closes them only with `closeOnClick`.
 */
export function useCheckableItem(
    context: MenuContextValue,
    {
        disabled,
        closeOnClick,
        change,
    }: {
        disabled: boolean;
        closeOnClick: boolean;
        change: (event: Event) => void;
    },
) {
    const key = useRef<"Enter" | " " | null>(null);
    return {
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
            if (event.key !== "Enter" && event.key !== " ") {
                return;
            }
            // the popup's own activation stays out of it
            event.preventDefault();
            key.current = event.key;
            event.currentTarget.click();
            key.current = null;
        },
        onClick: (event: MouseEvent) => {
            if (disabled) {
                return;
            }
            change(event.nativeEvent);
            const pressed = key.current;
            if (pressed === "Enter" || (pressed === null && closeOnClick)) {
                context.closeAll("item-press", event.nativeEvent);
            }
        },
    };
}
