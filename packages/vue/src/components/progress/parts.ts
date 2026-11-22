import { ProgressIndicator } from "./progress-indicator.ts";
import { ProgressLabel } from "./progress-label.ts";
import { ProgressRoot } from "./progress-root.ts";
import { ProgressTrack } from "./progress-track.ts";
import { ProgressValue } from "./progress-value.ts";

/** spec/progress.md */
export const Progress = {
    Root: ProgressRoot,
    Label: ProgressLabel,
    Value: ProgressValue,
    Track: ProgressTrack,
    Indicator: ProgressIndicator,
};
