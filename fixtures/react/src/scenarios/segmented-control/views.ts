/** The Items of the segmented control scenarios (spec/segmented-control.md, "Scenarios"). */
export interface Segment {
    value: string;
    label: string;
    disabled?: boolean;
}

export const VIEWS: readonly Segment[] = [
    { value: "list", label: "List" },
    { value: "grid", label: "Grid" },
    { value: "board", label: "Board", disabled: true },
    { value: "timeline", label: "Timeline" },
];

export const PERIODS: readonly Segment[] = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
];

export const DENSITIES: readonly Segment[] = [
    { value: "compact", label: "Compact" },
    { value: "comfortable", label: "Comfortable" },
    { value: "spacious", label: "Spacious" },
];
