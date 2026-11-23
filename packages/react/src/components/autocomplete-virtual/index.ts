// The entry of @fragiola/primitives-react/autocomplete-virtual: Autocomplete's opt-in virtual and
// async list (spec/virtual-lists.md), on the toolkit's virtualizer (`/virtual`). An app that does
// not import it ships neither.

export type { VirtualListProps } from "../../hooks/use-virtual-rows.ts";
// the component it is built on, from this entry too: an app imports both from here
export { Autocomplete } from "../autocomplete/parts.ts";
export type { AutocompleteVirtualListProps } from "./autocomplete-virtual-list.tsx";
export { AutocompleteVirtual } from "./parts.ts";
