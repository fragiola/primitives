// The entry of @fragiola/primitives-angular/switch: an on/off control, with form support
// (spec/switch.md, the APG's switch), as standalone attribute directives on the consumer's own
// elements.

export type {
    ChangeDetails,
    ChangeReason,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export {
    SwitchRoot,
    type SwitchState,
} from "./directives/switch-root.directive.ts";
export { SwitchThumb } from "./directives/switch-thumb.directive.ts";
