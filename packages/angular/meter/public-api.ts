// The entry of @fragiola/primitives-angular/meter: a scalar measurement within a known range
// (spec/meter.md, the APG meter), as standalone attribute directives on the consumer's own
// elements. Its value math and format are the toolkit's `/range`.

export { MeterIndicator } from "./directives/meter-indicator.directive.ts";
export { MeterLabel } from "./directives/meter-label.directive.ts";
export {
    MeterRoot,
    type MeterState,
} from "./directives/meter-root.directive.ts";
export { MeterTrack } from "./directives/meter-track.directive.ts";
export { MeterValue } from "./directives/meter-value.directive.ts";
