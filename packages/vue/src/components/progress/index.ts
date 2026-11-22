// The entry of @fragiola/primitives-vue/progress: how far a task has gone, or an indeterminate
// progress (spec/progress.md, the ARIA progressbar). Its value math and format are the toolkit's
// `/range`.

export type { ProgressStatus } from "@fragiola/primitives/range";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export { Progress } from "./parts.ts";
export type { ProgressState } from "./progress-context.ts";
export type { ProgressLabelProps } from "./progress-label.ts";
export type { ProgressRootProps } from "./progress-root.ts";
export type {
    ProgressValueSlotProps,
    ProgressValueSlots,
} from "./progress-value.ts";
