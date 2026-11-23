import { TagGroup as Primitive } from "@fragiola/primitives-react/tag-group";
import { tagGroup } from "examples-shared/recipes/tag-group";
import type { ComponentProps } from "react";

export const TagGroup = {
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={tagGroup.root} {...props} />
    ),
    Label: (props: ComponentProps<typeof Primitive.Label>) => (
        <Primitive.Label className={tagGroup.label} {...props} />
    ),
    List: (props: ComponentProps<typeof Primitive.List>) => (
        <Primitive.List className={tagGroup.list} {...props} />
    ),
    Tag: (props: ComponentProps<typeof Primitive.Tag>) => (
        <Primitive.Tag className={tagGroup.tag} {...props} />
    ),
    TagCell: (props: ComponentProps<typeof Primitive.TagCell>) => (
        <Primitive.TagCell className={tagGroup["tag-cell"]} {...props} />
    ),
    RemoveButton: (props: ComponentProps<typeof Primitive.RemoveButton>) => (
        <Primitive.RemoveButton
            className={tagGroup["remove-button"]}
            {...props}
        />
    ),
};
