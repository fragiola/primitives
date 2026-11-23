import { TagGroup as Primitive } from "@fragiola/primitives-vue/tag-group";
import { tagGroup } from "examples-shared/recipes/tag-group";
import { styled } from "../styled.ts";

export const TagGroup = {
    Root: styled(Primitive.Root, tagGroup.root),
    Label: styled(Primitive.Label, tagGroup.label),
    List: styled(Primitive.List, tagGroup.list),
    Tag: styled(Primitive.Tag, tagGroup.tag),
    TagCell: styled(Primitive.TagCell, tagGroup["tag-cell"]),
    RemoveButton: styled(Primitive.RemoveButton, tagGroup["remove-button"]),
};
