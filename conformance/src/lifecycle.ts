import type { Page } from "@playwright/test";

/**
 * The overlays of the lifecycle scenarios (spec/README.md, "The lifecycle scenarios"): the part
 * kept mounted (hidden while closed), the popup followed through its transitions, its role, and
 * how a test opens it.
 */
export interface LifecycleOverlay {
    path: string;
    /** The outermost portaled part, `hidden` while kept mounted and closed. */
    kept: string;
    /** The popup: the same node across openings, `data-ending-style` during its exit. */
    popup: string;
    /** The popup's role in the accessibility tree while open. */
    role: "dialog" | "alertdialog" | "menu" | "listbox" | "tooltip";
    open: (page: Page) => Promise<void>;
    /** The trigger focus returns to. */
    trigger: (page: Page) => ReturnType<Page["getByRole"]>;
    /** The fixture renders "Close with actions" (Dialog, Popover). */
    actions?: boolean;
    /**
     * What a press outside does: closes it (`true`); nothing at all (`"never"`: an AlertDialog,
     * spec/alert-dialog.md); omitted: a tooltip, which is no layer (the pointer leaving closes it).
     */
    outsidePress?: true | "never";
    today?: boolean;
}

const button = (name: string) => (page: Page) =>
    page.getByRole("button", { name, exact: true });

export const LIFECYCLE_OVERLAYS: Record<string, LifecycleOverlay> = {
    dialog: {
        path: "/dialog/lifecycle",
        kept: "dialog-popup",
        popup: "dialog-popup",
        role: "dialog",
        open: async (page) => button("Open dialog")(page).click(),
        trigger: (page) =>
            page.getByRole("button", {
                name: "Open dialog",
                includeHidden: true,
            }),
        actions: true,
        outsidePress: true,
    },
    "alert-dialog": {
        path: "/alert-dialog/lifecycle",
        kept: "alert-dialog-popup",
        popup: "alert-dialog-popup",
        role: "alertdialog",
        open: async (page) => button("Delete file")(page).click(),
        trigger: (page) =>
            page.getByRole("button", {
                name: "Delete file",
                includeHidden: true,
            }),
        actions: true,
        outsidePress: "never",
    },
    popover: {
        path: "/popover/lifecycle",
        kept: "popover-positioner",
        popup: "popover-popup",
        role: "dialog",
        open: async (page) => button("Open popover")(page).click(),
        trigger: button("Open popover"),
        actions: true,
        outsidePress: true,
    },
    tooltip: {
        path: "/tooltip/lifecycle",
        kept: "tooltip-positioner",
        popup: "tooltip-popup",
        role: "tooltip",
        // a hover (a focus opens it at once, `data-instant`, which the recipe does not animate)
        open: async (page) => {
            await page.mouse.move(0, 0);
            await button("Save")(page).hover();
        },
        trigger: button("Save"),
    },
    menu: {
        path: "/menu/lifecycle",
        kept: "menu-positioner",
        popup: "menu-popup",
        role: "menu",
        open: async (page) => button("Actions")(page).click(),
        trigger: button("Actions"),
        outsidePress: true,
    },
    "context-menu": {
        path: "/context-menu/lifecycle",
        kept: "context-menu-positioner",
        popup: "context-menu-popup",
        role: "menu",
        // a right-click in the area (spec/context-menu.md)
        open: async (page) =>
            page.getByText("Right-click here").click({ button: "right" }),
        trigger: (page) => page.getByText("Right-click here"),
        outsidePress: true,
    },
    select: {
        path: "/select/lifecycle",
        kept: "select-positioner",
        popup: "select-popup",
        role: "listbox",
        open: async (page) =>
            page.getByRole("combobox", { name: "Fruit" }).click(),
        trigger: (page) => page.getByRole("combobox", { name: "Fruit" }),
        outsidePress: true,
    },
    combobox: {
        path: "/combobox/lifecycle",
        kept: "combobox-positioner",
        popup: "combobox-popup",
        role: "listbox",
        open: async (page) => button("Show fruits")(page).click(),
        trigger: (page) => page.getByRole("combobox", { name: "Fruit" }),
        outsidePress: true,
    },
    "date-picker": {
        path: "/date-picker/lifecycle",
        kept: "date-picker-positioner",
        popup: "date-picker-popup",
        role: "dialog",
        open: async (page) => button("Choose date: none")(page).click(),
        trigger: button("Choose date: none"),
        outsidePress: true,
        today: true,
    },
};
