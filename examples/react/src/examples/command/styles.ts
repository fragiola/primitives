import { command } from "examples-shared/recipes/command";
import { dialog } from "examples-shared/recipes/dialog";

// The example's classes: the Command recipe (one string per part), Dialog's trigger and
// backdrop, a popup that only places the palette (the palette draws its own box), the shortcut
// hint and the status line.
export const styles = {
    ...command,
    groupLabel: command["group-label"],
    trigger: dialog.trigger,
    backdrop: dialog.backdrop,
    popup: "fixed top-16 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 max-w-[calc(100vw-2rem)] rounded-popup shadow-popup outline-hidden",
    stack: "flex flex-col items-start gap-(--pr-gap) font-primitives text-(length:--pr-size) text-palette-contrast",
    shortcut: "text-xs text-palette-accent",
    status: "text-palette-accent/85",
};
