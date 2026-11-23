// Adapted from the POC (@poc/styles, src/recipes/calendar.ts).
import type { Recipe } from "./recipe.ts";
import { BUTTON, FLOATING_BOX, FOCUS_RING } from "./shared.ts";

// spec/calendar.md, "Anatomy" (DatePicker and DateRangePicker share the parts); the calendar
// inside the popup takes the calendar recipe (calendar.ts)
export const datePicker: Recipe<"trigger" | "positioner" | "popup"> = {
    trigger: `${BUTTON} min-w-48 justify-start data-popup-open:bg-palette-soft`,
    positioner: "z-50",
    popup: `${FLOATING_BOX} p-4 ${FOCUS_RING}`,
};

// spec/calendar.md, "Typed input": the typed segments (the date field's recipe) with the Trigger
// beside them as the calendar button, an icon's width
export const datePickerInput: Recipe<"group" | "trigger"> = {
    group: "inline-flex items-center gap-1",
    trigger: `${BUTTON} px-2 data-popup-open:bg-palette-soft`,
};
