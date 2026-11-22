import { contextMenu } from "examples-shared/recipes/context-menu";

// The example's classes: the ContextMenu recipe (one string per part), its submenu trigger under
// a name the markup can read without a string, and the files inside the area.
export const styles = {
    ...contextMenu,
    submenuTrigger: contextMenu["submenu-trigger"],
    stack: "flex flex-col gap-2 font-primitives text-(length:--pr-size) text-palette-contrast",
    trigger: `${contextMenu.trigger} w-72`,
    heading: "font-medium text-palette-contrast",
    files: "flex w-full flex-col gap-1",
    file: "w-full rounded-control px-2 py-1 text-start text-palette-contrast hover:bg-palette-soft outline-hidden focus-visible:outline-solid focus-visible:outline-(length:--pr-focus-width) focus-visible:outline-palette-ring",
    status: "text-palette-accent/85",
};
