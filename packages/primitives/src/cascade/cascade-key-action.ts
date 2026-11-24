// A cascading select's keys while its popup is open (spec/cascade-select.md, "Keyboard"). Pure.

/** What a key does in an open cascading select. */
export type CascadeKeyAction =
    | "next"
    | "previous"
    | "first"
    | "last"
    | "open-level"
    | "close-level"
    | "choose"
    | "close";

/**
 * The action of a key in an open cascading select: ArrowDown / ArrowUp the next / previous item
 * of the level, Home / End its first / last, the inline-end arrow opens the highlighted parent's
 * level and the inline-start arrow closes the level (Right and Left in LTR, swapped in RTL, as a
 * menu's submenus), Enter and Space choose, Escape closes; `null` for any other key and for a key
 * with Alt, Ctrl or Meta.
 */
export function cascadeKeyAction(
    event: Pick<KeyboardEvent, "key" | "altKey" | "ctrlKey" | "metaKey">,
    rtl: boolean,
): CascadeKeyAction | null {
    if (event.altKey || event.ctrlKey || event.metaKey) {
        return null;
    }
    // a menu's submenu keys (`submenuKeys` of /collection), kept here so this entry shares no
    // chunk with /collection
    const open = rtl ? "ArrowLeft" : "ArrowRight";
    const close = rtl ? "ArrowRight" : "ArrowLeft";
    switch (event.key) {
        case "ArrowDown":
            return "next";
        case "ArrowUp":
            return "previous";
        case "Home":
            return "first";
        case "End":
            return "last";
        case open:
            return "open-level";
        case close:
            return "close-level";
        case "Enter":
        case " ":
            return "choose";
        case "Escape":
            return "close";
        default:
            return null;
    }
}
