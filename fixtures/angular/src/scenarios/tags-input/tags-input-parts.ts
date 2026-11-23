import {
    TagsInputClearTrigger,
    TagsInputControl,
    TagsInputInput,
    TagsInputRoot,
    TagsInputTag,
    TagsInputTagInput,
    TagsInputTagRemove,
    TagsInputTagText,
} from "@fragiola/primitives-angular/tags-input";

/** Every TagsInput directive, for a scenario's `imports`. */
export const TAGS_INPUT_PARTS = [
    TagsInputRoot,
    TagsInputControl,
    TagsInputInput,
    TagsInputTag,
    TagsInputTagText,
    TagsInputTagRemove,
    TagsInputTagInput,
    TagsInputClearTrigger,
] as const;

/**
 * The scenarios' Tags, from the Root `root` names (its `tags()`): a TagText, then (`editable`) a
 * TagInput "Edit tag", then a TagRemove "Remove <tag>", as React's.
 */
export function tagsInputTags(root: string, editable = false): string {
    return `@for (tag of ${root}.tags(); track $index) {<div tagsInputTag [index]="$index" [class]="styles.tag"><span tagsInputTagText [class]="styles['tag-text']">{{ tag }}</span>${editable ? `<input tagsInputTagInput aria-label="Edit tag" [class]="styles['tag-input']" />` : ""}<button tagsInputTagRemove [attr.aria-label]="'Remove ' + tag" [class]="styles['tag-remove']">×</button></div>}`;
}

/** A list as its values joined with `,`, `none` when empty. */
export function printList(values: readonly string[] | undefined): string {
    return values === undefined || values.length === 0
        ? "none"
        : values.join(",");
}
