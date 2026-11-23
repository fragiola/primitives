import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { SegmentedControl } from "../../kit/ui/segmented-control.tsx";
import { Segments } from "./segments.tsx";
import { PERIODS } from "./views.ts";

/** A vertical control that stops at its ends (spec/segmented-control.md, `/segmented-control/vertical`). */
export function SegmentedControlVertical() {
    const [value, setValue] = useState<string | null>();
    return (
        <>
            <h2 id="period" className="text-sm font-semibold">
                Period
            </h2>
            <SegmentedControl.Root
                aria-labelledby="period"
                orientation="vertical"
                loopFocus={false}
                defaultValue="day"
                onValueChange={(next) => setValue(next)}
            >
                <Segments segments={PERIODS} />
                <SegmentedControl.Indicator />
            </SegmentedControl.Root>
            <Output values={{ value }} />
        </>
    );
}
