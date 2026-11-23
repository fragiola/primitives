// The entry of @fragiola/primitives-angular/combobox-virtual: Combobox's opt-in virtual and async list
// (spec/virtual-lists.md), on the toolkit's virtualizer (`/virtual`). An app that does not import
// it ships neither.

// the component it is built on, from this entry too: an app imports both from here
export * from "@fragiola/primitives-angular/combobox";
export type {
    VirtualItemSize,
    VirtualRowData,
} from "@fragiola/primitives-angular/internal";
export { ComboboxVirtualList } from "./directives/combobox-virtual-list.directive.ts";
export { ComboboxVirtualRow } from "./directives/combobox-virtual-row.directive.ts";
