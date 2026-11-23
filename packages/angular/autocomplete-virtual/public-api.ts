// The entry of @fragiola/primitives-angular/autocomplete-virtual: Autocomplete's opt-in virtual and async list
// (spec/virtual-lists.md), on the toolkit's virtualizer (`/virtual`). An app that does not import
// it ships neither.

// the component it is built on, from this entry too: an app imports both from here
export * from "@fragiola/primitives-angular/autocomplete";
export type {
    VirtualItemSize,
    VirtualRowData,
} from "@fragiola/primitives-angular/internal";
export { AutocompleteVirtualList } from "./directives/autocomplete-virtual-list.directive.ts";
export { AutocompleteVirtualRow } from "./directives/autocomplete-virtual-row.directive.ts";
