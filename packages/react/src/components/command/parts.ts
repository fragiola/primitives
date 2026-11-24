import { CommandEmpty } from "./command-empty.tsx";
import { CommandGroup } from "./command-group.tsx";
import { CommandGroupLabel } from "./command-group-label.tsx";
import { CommandInput } from "./command-input.tsx";
import { CommandItem } from "./command-item.tsx";
import { CommandList } from "./command-list.tsx";
import { CommandLoading } from "./command-loading.tsx";
import { CommandRoot } from "./command-root.tsx";
import { CommandSeparator } from "./command-separator.tsx";

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
