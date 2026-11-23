import { SegmentedControl } from "../../kit/ui/segmented-control.tsx";
import type { Segment } from "./views.ts";

/** The Items of a scenario. */
export function Segments({ segments }: { segments: readonly Segment[] }) {
    return segments.map((segment) => (
        <SegmentedControl.Item
            key={segment.value}
            value={segment.value}
            disabled={segment.disabled}
        >
            {segment.label}
        </SegmentedControl.Item>
    ));
}
