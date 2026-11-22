// The entry of @fragiola/primitives-angular/progress: how far a task has gone, or an
// indeterminate progress (spec/progress.md, the ARIA progressbar), as standalone attribute
// directives on the consumer's own elements. Its value math and format are the toolkit's `/range`.

export type { ProgressStatus } from "@fragiola/primitives/range";
export { ProgressIndicator } from "./directives/progress-indicator.directive.ts";
export { ProgressLabel } from "./directives/progress-label.directive.ts";
export {
    ProgressRoot,
    type ProgressState,
} from "./directives/progress-root.directive.ts";
export { ProgressTrack } from "./directives/progress-track.directive.ts";
export { ProgressValue } from "./directives/progress-value.directive.ts";
