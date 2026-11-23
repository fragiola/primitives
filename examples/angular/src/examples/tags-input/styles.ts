import { tagsInput } from "examples-shared/recipes/tags-input";

// The example's classes: the TagsInput recipe (one string per part), its multi-word parts under
// names the markup can read without a string, the label and the message under the field.
export const styles = {
    ...tagsInput,
    tagText: tagsInput["tag-text"],
    tagRemove: tagsInput["tag-remove"],
    tagInput: tagsInput["tag-input"],
    clearTrigger: tagsInput["clear-trigger"],
    stack: "flex flex-col items-start gap-2 font-primitives text-(length:--pr-size) text-palette-contrast",
    label: "font-medium",
    status: "min-h-5 text-palette-accent/85",
};
