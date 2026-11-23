import { TagsInput as Primitive } from "@fragiola/primitives-react/tags-input";
import { tagsInput } from "examples-shared/recipes/tags-input";
import type { ComponentProps } from "react";

export const TagsInput = {
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={tagsInput.root} {...props} />
    ),
    Control: (props: ComponentProps<typeof Primitive.Control>) => (
        <Primitive.Control className={tagsInput.control} {...props} />
    ),
    Input: (props: ComponentProps<typeof Primitive.Input>) => (
        <Primitive.Input className={tagsInput.input} {...props} />
    ),
    Tag: (props: ComponentProps<typeof Primitive.Tag>) => (
        <Primitive.Tag className={tagsInput.tag} {...props} />
    ),
    TagText: (props: ComponentProps<typeof Primitive.TagText>) => (
        <Primitive.TagText className={tagsInput["tag-text"]} {...props} />
    ),
    TagRemove: (props: ComponentProps<typeof Primitive.TagRemove>) => (
        <Primitive.TagRemove className={tagsInput["tag-remove"]} {...props} />
    ),
    TagInput: (props: ComponentProps<typeof Primitive.TagInput>) => (
        <Primitive.TagInput className={tagsInput["tag-input"]} {...props} />
    ),
    ClearTrigger: (props: ComponentProps<typeof Primitive.ClearTrigger>) => (
        <Primitive.ClearTrigger
            className={tagsInput["clear-trigger"]}
            {...props}
        />
    ),
};
