import { Directive, input } from "@angular/core";
import {
    indicatorOptions,
    MenuRadioItemIndicator,
} from "@fragiola/primitives-angular/menu";

/**
 * Marks a checked RadioItem, Menu's RadioItemIndicator; structural:
 * `<span *contextMenuRadioItemIndicator>•</span>`, or `*contextMenuRadioItemIndicator="{ keepMounted: true }"`.
 */
@Directive({
    selector: "[contextMenuRadioItemIndicator]",
    exportAs: "contextMenuRadioItemIndicator",
})
export class ContextMenuRadioItemIndicator extends MenuRadioItemIndicator {
    /** `keepMounted`: rendered while the item is unchecked too (default `false`). */
    override readonly options = input<{ keepMounted: boolean }, unknown>(
        { keepMounted: false },
        { alias: "contextMenuRadioItemIndicator", transform: indicatorOptions },
    );
}
