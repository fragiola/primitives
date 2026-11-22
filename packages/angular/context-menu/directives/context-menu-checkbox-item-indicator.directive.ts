import { Directive, input } from "@angular/core";
import {
    indicatorOptions,
    MenuCheckboxItemIndicator,
} from "@fragiola/primitives-angular/menu";

/**
 * Marks a checked CheckboxItem, Menu's CheckboxItemIndicator; structural:
 * `<span *contextMenuCheckboxItemIndicator>✓</span>`, or `*contextMenuCheckboxItemIndicator="{ keepMounted: true }"`.
 */
@Directive({
    selector: "[contextMenuCheckboxItemIndicator]",
    exportAs: "contextMenuCheckboxItemIndicator",
})
export class ContextMenuCheckboxItemIndicator extends MenuCheckboxItemIndicator {
    /** `keepMounted`: rendered while the item is unchecked too (default `false`). */
    override readonly options = input<{ keepMounted: boolean }, unknown>(
        { keepMounted: false },
        {
            alias: "contextMenuCheckboxItemIndicator",
            transform: indicatorOptions,
        },
    );
}
