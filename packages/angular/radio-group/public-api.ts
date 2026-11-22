// The entry of @fragiola/primitives-angular/radio-group: a set of radios of which one can be
// checked, with form support (spec/radio-group.md, the APG's radio group), as a standalone
// attribute directive on the consumer's own element. Its radios come from `/radio`.

export type {
    ChangeDetails,
    ChangeReason,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export {
    type RadioEntry,
    RadioGroup,
    type RadioGroupOrientation,
    type RadioGroupState,
} from "./directives/radio-group.directive.ts";
