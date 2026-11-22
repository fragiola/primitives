import { computed, Directive, effect, inject, input } from "@angular/core";
import {
    conditionalView,
    dataAttributes,
    writeAttributes,
} from "@fragiola/primitives-angular/internal";
import { indicatorOptions } from "./menu-checkable-item.ts";
import { MenuCheckboxItem } from "./menu-checkbox-item.directive.ts";
import { MenuRootBase } from "./menu-root-base.ts";

/**
 * Marks a checked CheckboxItem, hidden from assistive technologies (spec/menu.md); structural, so
 * it is rendered only while its item is checked: `<span *menuCheckboxItemIndicator>✓</span>`, or
 * `*menuCheckboxItemIndicator="{ keepMounted: true }"` to keep it. The directive writes its
 * attributes on the element it renders.
 */
@Directive({
    selector: "[menuCheckboxItemIndicator]",
    exportAs: "menuCheckboxItemIndicator",
})
export class MenuCheckboxItemIndicator {
    /** `keepMounted`: rendered while the item is unchecked too (default `false`). */
    readonly options = input<{ keepMounted: boolean }, unknown>(
        { keepMounted: false },
        { alias: "menuCheckboxItemIndicator", transform: indicatorOptions },
    );
    private readonly item = inject(MenuCheckboxItem);
    private readonly level = inject(MenuRootBase);
    readonly state = computed(() => this.item.state());

    constructor() {
        const element = conditionalView(
            computed(() => this.options().keepMounted || this.state().checked),
        );
        effect(() => {
            const rendered = element();
            if (rendered === null) {
                return;
            }
            const { checked, disabled } = this.state();
            writeAttributes(rendered, {
                "aria-hidden": "true",
                "data-primitives-part": this.level.part(
                    "checkbox-item-indicator",
                ),
                ...dataAttributes({
                    checked,
                    unchecked: !checked,
                    disabled,
                }),
            });
        });
    }
}
