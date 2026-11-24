import { CommandEmpty } from "./command-empty.ts";
import { CommandGroup } from "./command-group.ts";
import { CommandGroupLabel } from "./command-group-label.ts";
import { CommandInput } from "./command-input.ts";
import { CommandItem } from "./command-item.ts";
import { CommandList } from "./command-list.ts";
import { CommandLoading } from "./command-loading.ts";
import { CommandRoot } from "./command-root.ts";
import { CommandSeparator } from "./command-separator.ts";

/** spec/command.md */
export const Command = {
    Root: CommandRoot,
    Input: CommandInput,
    List: CommandList,
    Group: CommandGroup,
    GroupLabel: CommandGroupLabel,
    Separator: CommandSeparator,
    Item: CommandItem,
    Empty: CommandEmpty,
    Loading: CommandLoading,
};
