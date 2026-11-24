import { Command as Primitive } from "@fragiola/primitives-react/command";
import {
    type CommandEntry,
    type CommandVirtualListProps,
    CommandVirtual as VirtualPrimitive,
} from "@fragiola/primitives-react/command-virtual";
import { command } from "examples-shared/recipes/command";
import type { ComponentProps } from "react";

export const Command = {
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={command.root} {...props} />
    ),
    Input: (props: ComponentProps<typeof Primitive.Input>) => (
        <Primitive.Input className={command.input} {...props} />
    ),
    List: (props: ComponentProps<typeof Primitive.List>) => (
        <Primitive.List className={command.list} {...props} />
    ),
    Group: (props: ComponentProps<typeof Primitive.Group>) => (
        <Primitive.Group className={command.group} {...props} />
    ),
    GroupLabel: (props: ComponentProps<typeof Primitive.GroupLabel>) => (
        <Primitive.GroupLabel className={command["group-label"]} {...props} />
    ),
    Separator: (props: ComponentProps<typeof Primitive.Separator>) => (
        <Primitive.Separator className={command.separator} {...props} />
    ),
    Item: (props: ComponentProps<typeof Primitive.Item>) => (
        <Primitive.Item className={command.item} {...props} />
    ),
    Empty: (props: ComponentProps<typeof Primitive.Empty>) => (
        <Primitive.Empty className={command.empty} {...props} />
    ),
    Loading: (props: ComponentProps<typeof Primitive.Loading>) => (
        <Primitive.Loading className={command.loading} {...props} />
    ),
};

export const CommandVirtual = {
    // generic, as the primitive: the entries' type comes from `items`
    List: <Entry extends CommandEntry>(
        props: CommandVirtualListProps<Entry>,
    ) => <VirtualPrimitive.List<Entry> className={command.list} {...props} />,
};
