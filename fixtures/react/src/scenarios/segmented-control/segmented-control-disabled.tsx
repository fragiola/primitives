import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { SegmentedControl } from "../../kit/ui/segmented-control.tsx";
import { Segments } from "./segments.tsx";
import { VIEWS } from "./views.ts";

const ENABLED = VIEWS.filter((view) => view.value !== "board").map(
    ({ value, label }) => ({ value, label }),
);

/** A disabled control (spec/segmented-control.md, `/segmented-control/disabled`). */
export function SegmentedControlDisabled() {
    const [value, setValue] = useState<string | null>();
    return (
        <>
            <h2 id="view" className="text-sm font-semibold">
                View
            </h2>
            <SegmentedControl.Root
                aria-labelledby="view"
                disabled
                defaultValue="grid"
                onValueChange={(next) => setValue(next)}
            >
                <Segments segments={ENABLED} />
                <SegmentedControl.Indicator />
            </SegmentedControl.Root>
            <button type="button" className="mt-2">
                After
            </button>
            <Output values={{ value }} />
        </>
    );
}
