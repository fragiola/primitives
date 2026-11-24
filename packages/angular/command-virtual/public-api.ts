// The entry of @fragiola/primitives-angular/command-virtual: Command's opt-in virtual list
// (spec/command.md, "Virtual list"), on the toolkit's virtualizer (`/virtual`). An app that does
// not import it ships none of it.

// the component it is built on, from this entry too: an app imports both from here
export * from "@fragiola/primitives-angular/command";
export type {
    VirtualItemSize,
    VirtualRowData,
} from "@fragiola/primitives-angular/internal";
export { CommandVirtualList } from "./directives/command-virtual-list.directive.ts";
export { CommandVirtualRow } from "./directives/command-virtual-row.directive.ts";
