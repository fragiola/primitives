import { tabs } from "examples-shared/recipes/tabs";

// The example's classes: the Tabs recipe (one string per part), and the content of the panels.
export const styles = {
    ...tabs,
    root: `${tabs.root} w-full max-w-lg`,
    panel: `${tabs.panel} flex flex-col gap-2 py-2`,
    heading: "font-semibold",
    text: "text-palette-accent/85",
};
