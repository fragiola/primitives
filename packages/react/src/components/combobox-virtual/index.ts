// The entry of @fragiola/primitives-react/combobox-virtual: Combobox's opt-in virtual and async
// list (spec/virtual-lists.md), on the toolkit's virtualizer (`/virtual`). An app that does not
// import it ships neither.

export type { VirtualListProps } from "../../hooks/use-virtual-rows.ts";
// the component it is built on, from this entry too: an app imports both from here
export { Combobox } from "../combobox/parts.ts";
export type { ComboboxVirtualListProps } from "./combobox-virtual-list.tsx";
export { ComboboxVirtual } from "./parts.ts";
