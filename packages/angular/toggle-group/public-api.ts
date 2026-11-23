// The entry of @fragiola/primitives-angular/toggle-group: toggles sharing one value, one tab stop
// (spec/toggle-group.md, Base UI's ToggleGroup), as a standalone attribute directive on the
// consumer's own element. Its toggles come from `/toggle`.

export type {
    ChangeDetails,
    ChangeReason,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export {
    ToggleGroup,
    type ToggleGroupState,
} from "./directives/toggle-group.directive.ts";
