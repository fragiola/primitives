import { TagsInputClearTrigger } from "./tags-input-clear-trigger.tsx";
import { TagsInputControl } from "./tags-input-control.tsx";
import { TagsInputInput } from "./tags-input-input.tsx";
import { TagsInputRoot } from "./tags-input-root.tsx";
import { TagsInputTag } from "./tags-input-tag.tsx";
import { TagsInputTagInput } from "./tags-input-tag-input.tsx";
import { TagsInputTagRemove } from "./tags-input-tag-remove.tsx";
import { TagsInputTagText } from "./tags-input-tag-text.tsx";

/** spec/tags-input.md */
export const TagsInput = {
    Root: TagsInputRoot,
    Control: TagsInputControl,
    Input: TagsInputInput,
    Tag: TagsInputTag,
    TagText: TagsInputTagText,
    TagRemove: TagsInputTagRemove,
    TagInput: TagsInputTagInput,
    ClearTrigger: TagsInputClearTrigger,
};
