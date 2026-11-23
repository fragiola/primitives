import { TagsInput as Primitive } from "@fragiola/primitives-vue/tags-input";
import { tagsInput } from "examples-shared/recipes/tags-input";
import { styled } from "../styled.ts";

export const TagsInput = {
    Root: styled(Primitive.Root, tagsInput.root),
    Control: styled(Primitive.Control, tagsInput.control),
    Input: styled(Primitive.Input, tagsInput.input),
    Tag: styled(Primitive.Tag, tagsInput.tag),
    TagText: styled(Primitive.TagText, tagsInput["tag-text"]),
    TagRemove: styled(Primitive.TagRemove, tagsInput["tag-remove"]),
    TagInput: styled(Primitive.TagInput, tagsInput["tag-input"]),
    ClearTrigger: styled(Primitive.ClearTrigger, tagsInput["clear-trigger"]),
};
