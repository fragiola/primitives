import {
    TagGroupLabel,
    TagGroupList,
    TagGroupRemoveButton,
    TagGroupRoot,
    TagGroupTag,
    TagGroupTagCell,
} from "@fragiola/primitives-angular/tag-group";

/** Every TagGroup directive, for a scenario's `imports`. */
export const TAG_GROUP_PARTS = [
    TagGroupRoot,
    TagGroupLabel,
    TagGroupList,
    TagGroupTag,
    TagGroupTagCell,
    TagGroupRemoveButton,
] as const;

/**
 * The scenarios' Tags (`tags` names the array in the component): each a TagCell with its name
 * (one text node) and, when removable, its RemoveButton, as React's. `disabled` names the
 * component's array of disabled values.
 */
export function tagGroupTags(
    tags: string,
    removable = false,
    disabled?: string,
): string {
    return `@for (tag of ${tags}; track tag.value) {<div tagGroupTag [value]="tag.value"${disabled === undefined ? "" : ` [disabled]="${disabled}.includes(tag.value)"`} [class]="styles.tag"><div tagGroupTagCell [class]="styles['tag-cell']">{{ tag.label }}${removable ? `<button tagGroupRemoveButton [attr.aria-label]="'Remove ' + tag.label" [class]="styles['remove-button']">×</button>` : ""}</div></div>}`;
}
