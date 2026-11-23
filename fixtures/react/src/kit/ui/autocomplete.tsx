import {
    type AutocompleteListProps,
    Autocomplete as Primitive,
} from "@fragiola/primitives-react/autocomplete";
import { autocomplete } from "examples-shared/recipes/autocomplete";
import type { ComponentProps } from "react";

export const Autocomplete = {
    Root: Primitive.Root,
    Portal: Primitive.Portal,
    Value: Primitive.Value,
    InputGroup: (props: ComponentProps<typeof Primitive.InputGroup>) => (
        <Primitive.InputGroup
            className={autocomplete["input-group"]}
            {...props}
        />
    ),
    Input: (props: ComponentProps<typeof Primitive.Input>) => (
        <Primitive.Input className={autocomplete.input} {...props} />
    ),
    Trigger: (props: ComponentProps<typeof Primitive.Trigger>) => (
        <Primitive.Trigger className={autocomplete.trigger} {...props} />
    ),
    Clear: (props: ComponentProps<typeof Primitive.Clear>) => (
        <Primitive.Clear className={autocomplete.clear} {...props} />
    ),
    Status: (props: ComponentProps<typeof Primitive.Status>) => (
        <Primitive.Status className={autocomplete.status} {...props} />
    ),
    Positioner: (props: ComponentProps<typeof Primitive.Positioner>) => (
        <Primitive.Positioner className={autocomplete.positioner} {...props} />
    ),
    Popup: (props: ComponentProps<typeof Primitive.Popup>) => (
        <Primitive.Popup className={autocomplete.popup} {...props} />
    ),
    Empty: (props: ComponentProps<typeof Primitive.Empty>) => (
        <Primitive.Empty className={autocomplete.empty} {...props} />
    ),
    // generic, as the primitive: the entries' type comes from the render function
    List: <Entry,>(props: AutocompleteListProps<Entry>) => (
        <Primitive.List<Entry> className={autocomplete.list} {...props} />
    ),
    Group: (props: ComponentProps<typeof Primitive.Group>) => (
        <Primitive.Group className={autocomplete.group} {...props} />
    ),
    GroupLabel: (props: ComponentProps<typeof Primitive.GroupLabel>) => (
        <Primitive.GroupLabel
            className={autocomplete["group-label"]}
            {...props}
        />
    ),
    Separator: (props: ComponentProps<typeof Primitive.Separator>) => (
        <Primitive.Separator className={autocomplete.separator} {...props} />
    ),
    Item: (props: ComponentProps<typeof Primitive.Item>) => (
        <Primitive.Item className={autocomplete.item} {...props} />
    ),
};
