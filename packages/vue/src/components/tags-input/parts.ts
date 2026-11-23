import { TagsInputClearTrigger } from "./tags-input-clear-trigger.ts";
import { TagsInputControl } from "./tags-input-control.ts";
import { TagsInputInput } from "./tags-input-input.ts";
import { TagsInputRoot } from "./tags-input-root.ts";
import { TagsInputTag } from "./tags-input-tag.ts";
import { TagsInputTagInput } from "./tags-input-tag-input.ts";
import { TagsInputTagRemove } from "./tags-input-tag-remove.ts";
import { TagsInputTagText } from "./tags-input-tag-text.ts";

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
