import type { Recipe } from "./recipe.ts";

// spec/meter.md, "Anatomy". The Label and the Value share a row over the Track, as Progress's;
// the Indicator is placed by its structural style (`inset-inline-start`, `inline-size`) and only
// drawn here.
export const meter: Recipe<"root" | "label" | "value" | "track" | "indicator"> =
    {
        root: "flex w-64 flex-wrap items-center justify-between gap-y-1 font-primitives text-(length:--pr-size) text-palette-contrast",
        label: "font-medium text-palette-contrast",
        value: "tabular-nums text-palette-accent",
        track: "relative h-2 basis-full overflow-hidden rounded-full bg-palette-soft",
        indicator:
            "absolute inset-y-0 rounded-full bg-palette-contrast transition-[inline-size] duration-(--pr-motion)",
    };
