// The entry of @fragiola/primitives-angular/select-virtual: Select's opt-in virtual and async list
// (spec/virtual-lists.md), on the toolkit's virtualizer (`/virtual`). An app that does not import
// it ships neither.

export type {
    VirtualItemSize,
    VirtualRowData,
} from "@fragiola/primitives-angular/internal";
// the component it is built on, from this entry too: an app imports both from here
export * from "@fragiola/primitives-angular/select";
export { SelectVirtualList } from "./directives/select-virtual-list.directive.ts";
export { SelectVirtualRow } from "./directives/select-virtual-row.directive.ts";
