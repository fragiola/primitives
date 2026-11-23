// The entry of @fragiola/primitives-angular/toggle: a two-state button, alone, in a ToggleGroup or
// in a Toolbar (spec/toggle.md, the APG's toggle button), as a standalone attribute directive on
// the consumer's own element. A Toggle alone ships no ToggleGroup code: the group's context is the
// package's shared code.

export type {
    ChangeDetails,
    ChangeReason,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export { Toggle, type ToggleState } from "./directives/toggle.directive.ts";
