// The entry of @fragiola/primitives-angular/listbox-virtual: Listbox's opt-in virtual and async
// list (spec/virtual-lists.md), on the toolkit's virtualizer (`/virtual`) and collections
// mechanism (`/selection`). Its options are `[listboxItem]`s, each with the `[listboxVirtualRow]`
// of its row.

export type {
    VirtualItemSize,
    VirtualRowData,
} from "@fragiola/primitives-angular/internal";
// the component it is built on, from this entry too: an app imports both from here
export * from "@fragiola/primitives-angular/listbox";
export {
    type ListboxVirtualItem,
    ListboxVirtualRoot,
} from "./directives/listbox-virtual-root.directive.ts";
export { ListboxVirtualRow } from "./directives/listbox-virtual-row.directive.ts";
