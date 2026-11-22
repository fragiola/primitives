import type { MenuContext } from "./menu-context.ts";

/**
 * The activation of a CheckboxItem or a RadioItem (spec/menu.md, "Activating a checkable item"):
 * Space and Enter fire its `click`; the click changes the state, then Enter closes every level,
 * Space keeps them open, and a pointer click closes them only with `closeOnClick`.
 */
export function useCheckableItem(
    context: MenuContext,
    options: {
        disabled: () => boolean;
        closeOnClick: () => boolean;
        change: (event: Event) => void;
    },
) {
    let key: "Enter" | " " | null = null;
    return {
        onKeydown: (event: KeyboardEvent) => {
            if (event.key !== "Enter" && event.key !== " ") {
                return;
            }
            // the popup's own activation stays out of it
            event.preventDefault();
            key = event.key;
            (event.currentTarget as HTMLElement).click();
            key = null;
        },
        onClick: (event: MouseEvent) => {
            if (options.disabled()) {
                return;
            }
            options.change(event);
            const pressed = key;
            if (
                pressed === "Enter" ||
                (pressed === null && options.closeOnClick())
            ) {
                context.closeAll("item-press", event);
            }
        },
    };
}
