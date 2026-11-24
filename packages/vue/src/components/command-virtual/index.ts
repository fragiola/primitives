// The entry of @fragiola/primitives-vue/command-virtual: Command's opt-in virtual list
// (spec/command.md, "Virtual list"), on the toolkit's virtualizer (`/virtual`). An app that does
// not import it ships none of it.

export type { CommandEntry } from "@fragiola/primitives/command";
export type {
    VirtualListEmits,
    VirtualListProps,
} from "../../composables/use-virtual-rows.ts";
// the component it is built on, from this entry too: an app imports both from here
export { Command } from "../command/parts.ts";
export type {
    CommandVirtualListProps,
    CommandVirtualListSlots,
} from "./command-virtual-list.ts";
export { CommandVirtual } from "./parts.ts";
