import { CalendarPreset as Primitive } from "@fragiola/primitives-react/calendar-preset";
import { calendarPreset } from "examples-shared/recipes/calendar";
import type { ComponentProps, ReactNode } from "react";

/** The presets of a calendar, in a row under its grid. */
export function PresetList({ children }: { children: ReactNode }) {
    return <div className={calendarPreset.list}>{children}</div>;
}

export function CalendarPreset(props: ComponentProps<typeof Primitive>) {
    return <Primitive className={calendarPreset.preset} {...props} />;
}
