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
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
import { MenuRootBase } from "./menu-root-base.ts";

/**
 * A `group` of RadioItems holding their value (spec/menu.md): two-way `[(value)]` (`null` for
 * none) or its own (`defaultValue`). `<div menuRadioGroup [(value)]="sort">`.
 */
@Directive({
    selector: "[menuRadioGroup]",
    exportAs: "menuRadioGroup",
    host: {
        role: "group",
        "[attr.data-primitives-part]": "part",
        "[attr.data-disabled]": "data().disabled",
    },
})
export class MenuRadioGroup {
    /** The checked RadioItem's value; `null` for none. */
    readonly value = input<string | null | undefined>(undefined);
    readonly valueChange = output<string | null>();
    readonly defaultValue = input<string | null>(null);
    /** Every change of the value with its details (`{ value, details }`). */
    readonly valueChangeDetails = output<ValueChangeEvent<string | null>>();
    /** Disables every RadioItem of the group. */
    readonly disabled = input(false, { transform: booleanAttribute });
    protected readonly part =
        inject(MenuRootBase, { optional: true })?.part("radio-group") ??
        "menu-radio-group";
    private readonly selection = controllable<string | null, ChangeDetails>(
        this.value,
        this.valueChange,
        () => this.defaultValue(),
        (value, details) => this.valueChangeDetails.emit({ value, details }),
    );
    /** The checked RadioItem's value. */
    readonly selected = this.selection.value;
    readonly state = computed(() => ({ disabled: this.disabled() }));
    protected readonly data = computed(() => dataValues(this.state()));

    /** Checks the RadioItem of this value (reason `item-press`). */
    check(value: string, event: Event): void {
        this.selection.set(value, { reason: "item-press", event });
    }
}
