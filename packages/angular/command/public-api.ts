// The entry of @fragiola/primitives-angular/command: a command palette (spec/command.md, the APG
// combobox with an always displayed listbox of actions), as standalone attribute directives on
// the consumer's own elements. Its scorer is the toolkit's `/command`; the virtual list is the
// opt-in `/command-virtual`, so this entry bundles no `/virtual`.

export type {
    CommandEntry,
    CommandFilter,
} from "@fragiola/primitives/command";
export type {
    ChangeDetails,
    ChangeReason,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export { CommandEmpty } from "./directives/command-empty.directive.ts";
export { CommandGroup } from "./directives/command-group.directive.ts";
export { CommandGroupLabel } from "./directives/command-group-label.directive.ts";
export { CommandInput } from "./directives/command-input.directive.ts";
export {
    CommandItem,
    type CommandItemState,
} from "./directives/command-item.directive.ts";
export {
    CommandList,
    type CommandListState,
} from "./directives/command-list.directive.ts";
export { CommandLoading } from "./directives/command-loading.directive.ts";
export {
    type CommandItemInfo,
    CommandRoot,
    type CommandRootState,
    type CommandSelectEvent,
} from "./directives/command-root.directive.ts";
export { CommandSeparator } from "./directives/command-separator.directive.ts";
export { injectCommand } from "./inject/inject-command.ts";
