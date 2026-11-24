// The entry of @fragiola/primitives-vue/command: a command palette (spec/command.md, the APG
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
export type { RenderSlotProps } from "../../utils/render-part.ts";
export type {
    CommandItemEmits,
    CommandItemProps,
    CommandItemState,
} from "./command-item.ts";
export type { CommandListState } from "./command-list.ts";
export type {
    CommandRootEmits,
    CommandRootProps,
    CommandRootState,
} from "./command-root.ts";
export type { CommandSeparatorProps } from "./command-separator.ts";
export { Command } from "./parts.ts";
