import type { Align, Side } from "@fragiola/primitives/positioning";
import type { ComputedRef, InjectionKey, Ref } from "vue";
import type { FieldControlBinding } from "../../composables/use-field-control.ts";
import type { OverlayRoot } from "../../composables/use-overlay-root.ts";
import type { ChangeReason } from "../../utils/change-details.ts";

/** One item of the Root's `items` (spec/select.md, "API"). */
export interface SelectItemData {
    value: string;
    label: string;
    disabled?: boolean;
}

/** An Item that registered itself (a Select without `items`: spec/select.md, "API"). */
export interface RegisteredItem extends SelectItemData {
    element: HTMLElement;
}

export interface SelectContext extends OverlayRoot {
    /** The enclosing field's binding, for the trigger (spec/field.md). */
    field: FieldControlBinding;
    /** The Root's `items`, else the registered Items, in DOM order. */
    items: () => readonly SelectItemData[];
    /** Whether the Items register themselves (no `items` on the Root). */
    registers: () => boolean;
    /** Registers an Item (without `items`); returns its unregistration. */
    registerItem: (item: RegisteredItem) => () => void;
    value: ComputedRef<string | null>;
    disabled: () => boolean;
    required: () => boolean;
    /** spec/select.md, "Modal". */
    modal: () => boolean;
    highlighted: Ref<string | null>;
    /** Opens the list with this item highlighted. */
    openOn: (value: string | null, reason: ChangeReason, event?: Event) => void;
    /** Chooses an enabled item and closes. */
    choose: (value: string, reason: ChangeReason, event?: Event) => void;
    listId: string;
    /** The id of item `value`'s option element. */
    itemId: (value: string) => string;
    placed: Ref<{ side: Side; align: Align }>;
}

export const SelectKey: InjectionKey<SelectContext> = Symbol("Select");

export interface SelectItemState {
    selected: boolean;
    highlighted: boolean;
    disabled: boolean;
}

/** What a Group gives its GroupLabel: where the label reports its id. */
export const SelectGroupKey: InjectionKey<Ref<string | undefined>> =
    Symbol("SelectGroup");

export const SelectItemKey: InjectionKey<ComputedRef<SelectItemState>> =
    Symbol("SelectItem");

/** The item to highlight when the list opens: the selected one, else the first enabled one. */
export function initialHighlight(
    items: readonly SelectItemData[],
    value: string | null,
): string | null {
    if (value !== null && items.some((item) => item.value === value)) {
        return value;
    }
    return items.find((item) => !item.disabled)?.value ?? null;
}
