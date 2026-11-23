import {
    ListboxGroup,
    ListboxGroupLabel,
    ListboxItem,
    ListboxItemIndicator,
    ListboxRoot,
    ListboxSeparator,
} from "@fragiola/primitives-angular/listbox";

/** Every Listbox directive, for a scenario's `imports`. */
export const LISTBOX_PARTS = [
    ListboxRoot,
    ListboxItem,
    ListboxItemIndicator,
    ListboxGroup,
    ListboxGroupLabel,
    ListboxSeparator,
] as const;

/**
 * The Items of a list of options (`options` names the array in the component), each with its
 * label and indicator: the label one text node, then the indicator, as React's.
 */
export function listboxOptions(options: string): string {
    return `@for (option of ${options}; track option.value) {<div listboxItem [value]="option.value" [disabled]="!!option.disabled" [class]="styles.item">{{ option.label }}<span *listboxItemIndicator [class]="styles['item-indicator']">✓</span></div>}`;
}
