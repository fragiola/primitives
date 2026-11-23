import type { Recipe } from "./recipe.ts";

// spec/date-field.md, "Anatomy" (DateField and TimeField share it). The Input is one bordered
// control holding the segments inline, not as flex items: the bidirectional text orders them
// ("Bidirectional text"), which a flex row in a right-to-left page would reverse. A focused segment is filled with the contrast role (its
// caret hidden: the field writes the text), a placeholder and the literals are set in the accent
// role; an invalid field gets the heavier contrast border, as Field's control.
export const dateField: Recipe<"root" | "input" | "segment"> = {
    root: "flex flex-col items-start gap-1 font-primitives text-(length:--pr-size) text-palette-contrast",
    input: "inline-block h-(--pr-control-height) whitespace-nowrap leading-[calc(var(--pr-control-height)-2px)] rounded-control border border-palette-line bg-palette-base px-2 tabular-nums text-palette-contrast data-invalid:border-2 data-invalid:border-palette-contrast data-disabled:opacity-50 focus-within:outline-solid focus-within:outline-(length:--pr-focus-width) focus-within:outline-offset-2 focus-within:outline-palette-ring",
    segment:
        "rounded-sm px-0.5 caret-transparent outline-hidden focus:bg-palette-contrast focus:text-palette-base data-placeholder:text-palette-accent data-[type=literal]:px-0 data-[type=literal]:text-palette-accent",
};

// spec/date-range-field.md, "Anatomy": the two ends' Inputs side by side (start, then end, in the
// page's direction) with the consumer's separator between them; each Input and Segment as
// DateField's.
export const dateRangeField: Recipe<"root" | "ends" | "separator"> = {
    root: dateField.root,
    ends: "flex items-center gap-1",
    separator: "text-palette-accent",
};
