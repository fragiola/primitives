import {
    booleanAttribute,
    computed,
    Directive,
    inject,
    input,
    output,
} from "@angular/core";
import {
    type ChangeDetails,
    controllable,
    dataValues,
    injectHost,
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
import {
    checkableActivation,
    checkedAttributes,
    type MenuCheckableItemState,
} from "./menu-checkable-item.ts";
import { menuItemBehaviour } from "./menu-item-behaviour.ts";
import { MenuRootBase } from "./menu-root-base.ts";

export type MenuCheckboxItemState = MenuCheckableItemState;

/**
 * A `menuitemcheckbox` (spec/menu.md): toggles its checked state, two-way `[(checked)]` or its
 * own (`defaultChecked`). `<div menuCheckboxItem [(checked)]="toolbar">`. Space toggles it and
 * keeps the menu open, Enter toggles it and closes every level, a click closes them only with
 * `closeOnClick`.
 */
@Directive({
    selector: "[menuCheckboxItem]",
    exportAs: "menuCheckboxItem",
    host: {
        role: "menuitemcheckbox",
        tabindex: "-1",
        "[attr.data-primitives-part]": "level.part('checkbox-item')",
        "[attr.aria-checked]": "state().checked ? 'true' : 'false'",
        "[attr.aria-disabled]": "state().disabled ? 'true' : null",
        "[attr.data-checked]": "data().checked",
        "[attr.data-unchecked]": "data().unchecked",
        "[attr.data-highlighted]": "data().highlighted",
        "[attr.data-disabled]": "data().disabled",
        "(focus)": "item.onFocus()",
        "(blur)": "item.onBlur()",
        "(pointermove)": "item.onPointerMove($event)",
        "(pointerleave)": "item.onPointerLeave()",
        "(keydown)": "activation.onKeyDown($event)",
        "(click)": "activation.onClick($event)",
    },
})
export class MenuCheckboxItem {
    protected readonly level = inject(MenuRootBase);
    readonly checked = input<boolean | undefined>(undefined);
    readonly checkedChange = output<boolean>();
    readonly defaultChecked = input(false, { transform: booleanAttribute });
    /** Every change of the checked state with its details (`{ value, details }`). */
    readonly checkedChangeDetails = output<ValueChangeEvent<boolean>>();
    readonly disabled = input(false, { transform: booleanAttribute });
    /** The text typeahead matches (default: the item's text). */
    readonly label = input<string | undefined>(undefined);
    /** A click closes every menu level (default `false`; Enter always closes, Space never). */
    readonly closeOnClick = input(false, { transform: booleanAttribute });
    private readonly host = injectHost();
    protected readonly item = menuItemBehaviour(
        this.level,
        this.host,
        this.label,
        false,
    );
    private readonly value = controllable<boolean, ChangeDetails>(
        this.checked,
        this.checkedChange,
        () => this.defaultChecked(),
        (value, details) => this.checkedChangeDetails.emit({ value, details }),
    );
    readonly state = computed<MenuCheckboxItemState>(() => ({
        checked: this.value.value(),
        highlighted: this.item.highlighted(),
        disabled: this.disabled(),
    }));
    protected readonly data = computed(() =>
        dataValues(checkedAttributes(this.state())),
    );
    protected readonly activation = checkableActivation(this.level, this.host, {
        disabled: () => this.disabled(),
        closeOnClick: () => this.closeOnClick(),
        change: (event) =>
            this.value.set(!this.value.value(), {
                reason: "item-press",
                event,
            }),
    });
}
