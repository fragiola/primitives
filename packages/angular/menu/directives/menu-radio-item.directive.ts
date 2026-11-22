import {
    booleanAttribute,
    computed,
    Directive,
    inject,
    input,
} from "@angular/core";
import { dataValues, injectHost } from "@fragiola/primitives-angular/internal";
import {
    checkableActivation,
    checkedAttributes,
    type MenuCheckableItemState,
} from "./menu-checkable-item.ts";
import { menuItemBehaviour } from "./menu-item-behaviour.ts";
import { MenuRadioGroup } from "./menu-radio-group.directive.ts";
import { MenuRootBase } from "./menu-root-base.ts";

export type MenuRadioItemState = MenuCheckableItemState;

/**
 * A `menuitemradio` of its RadioGroup (spec/menu.md): checks its value. `<div menuRadioItem
 * value="name">`. Space checks it and keeps the menu open, Enter checks it and closes every level,
 * a click closes them only with `closeOnClick`.
 */
@Directive({
    selector: "[menuRadioItem]",
    exportAs: "menuRadioItem",
    host: {
        role: "menuitemradio",
        tabindex: "-1",
        "[attr.data-primitives-part]": "level.part('radio-item')",
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
export class MenuRadioItem {
    protected readonly level = inject(MenuRootBase);
    private readonly group = this.requireGroup();
    readonly value = input.required<string>();
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
    /** Its own `disabled`, or its group's. */
    private readonly isDisabled = computed(
        () => this.disabled() || this.group.disabled(),
    );
    readonly state = computed<MenuRadioItemState>(() => ({
        checked: this.group.selected() === this.value(),
        highlighted: this.item.highlighted(),
        disabled: this.isDisabled(),
    }));
    protected readonly data = computed(() =>
        dataValues(checkedAttributes(this.state())),
    );
    protected readonly activation = checkableActivation(this.level, this.host, {
        disabled: () => this.isDisabled(),
        closeOnClick: () => this.closeOnClick(),
        change: (event) => this.group.check(this.value(), event),
    });

    private requireGroup(): MenuRadioGroup {
        const group = inject(MenuRadioGroup, { optional: true });
        if (group === null) {
            throw new Error(
                "[menuRadioItem] must be inside a [menuRadioGroup].",
            );
        }
        return group;
    }
}
