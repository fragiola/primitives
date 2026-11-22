import { computed, Directive, effect, inject, input } from "@angular/core";
import {
    conditionalView,
    dataAttributes,
    writeAttributes,
} from "@fragiola/primitives-angular/internal";
import { indicatorOptions } from "./menu-checkable-item.ts";
import { MenuRadioItem } from "./menu-radio-item.directive.ts";
import { MenuRootBase } from "./menu-root-base.ts";

/**
 * Marks a checked RadioItem, hidden from assistive technologies (spec/menu.md); structural, so
 * it is rendered only while its item is checked: `<span *menuRadioItemIndicator>•</span>`, or
 * `*menuRadioItemIndicator="{ keepMounted: true }"` to keep it. The directive writes its
 * attributes on the element it renders.
 */
@Directive({
    selector: "[menuRadioItemIndicator]",
    exportAs: "menuRadioItemIndicator",
})
export class MenuRadioItemIndicator {
    /** `keepMounted`: rendered while the item is unchecked too (default `false`). */
    readonly options = input<{ keepMounted: boolean }, unknown>(
        { keepMounted: false },
        { alias: "menuRadioItemIndicator", transform: indicatorOptions },
    );
    private readonly item = inject(MenuRadioItem);
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
                "data-primitives-part": this.level.part("radio-item-indicator"),
                ...dataAttributes({
                    checked,
                    unchecked: !checked,
                    disabled,
                }),
            });
        });
    }
}
