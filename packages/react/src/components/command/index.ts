// The entry of @fragiola/primitives-react/command: a command palette (spec/command.md, the APG
// combobox with an always displayed listbox of actions). Its scorer is the toolkit's `/command`;
// the virtual list is the opt-in `/command-virtual`, so this entry bundles no `/virtual`.

export type {
    CommandEntry,
    CommandFilter,
} from "@fragiola/primitives/command";
export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderProp } from "../../utils/render-element.tsx";
export type {
    CommandItemProps,
    CommandItemState,
} from "./command-item.tsx";
export type { CommandListState } from "./command-list.tsx";
export type {
    CommandRootProps,
    CommandRootState,
} from "./command-root.tsx";
export type { CommandSeparatorProps } from "./command-separator.tsx";
export { Command } from "./parts.ts";
