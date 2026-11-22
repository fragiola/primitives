// The entry of @fragiola/primitives-react/progress: how far a task has gone, or an indeterminate
// progress (spec/progress.md, the ARIA progressbar). Its value math and format are the toolkit's
// `/range`.

export type { ProgressStatus } from "@fragiola/primitives/range";
export type { RenderProp } from "../../utils/render-element.tsx";
export { Progress } from "./parts.ts";
export type { ProgressState } from "./progress-context.ts";
export type { ProgressIndicatorProps } from "./progress-indicator.tsx";
export type { ProgressLabelProps } from "./progress-label.tsx";
export type { ProgressRootProps } from "./progress-root.tsx";
export type { ProgressTrackProps } from "./progress-track.tsx";
export type { ProgressValueProps } from "./progress-value.tsx";
