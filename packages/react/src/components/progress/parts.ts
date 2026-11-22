import { ProgressIndicator } from "./progress-indicator.tsx";
import { ProgressLabel } from "./progress-label.tsx";
import { ProgressRoot } from "./progress-root.tsx";
import { ProgressTrack } from "./progress-track.tsx";
import { ProgressValue } from "./progress-value.tsx";

/** spec/progress.md */
export const Progress = {
    Root: ProgressRoot,
    Label: ProgressLabel,
    Value: ProgressValue,
    Track: ProgressTrack,
    Indicator: ProgressIndicator,
};
