import { clipboard } from "examples-shared/recipes/clipboard";

// The example's classes: the Clipboard recipe (one string per part) and the code block the Root
// is drawn as.
export const styles = {
    ...clipboard,
    block: "flex w-96 items-center justify-between gap-3 rounded-control border border-palette-line bg-palette-soft py-2 ps-4 pe-2 font-primitives text-palette-contrast",
    code: "font-mono text-xs",
};
