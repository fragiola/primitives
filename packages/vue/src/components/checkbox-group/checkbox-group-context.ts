import type { ComputedRef, InjectionKey, Ref } from "vue";
import type { FieldControlBinding } from "../../composables/use-field-control.ts";

export interface CheckboxGroupContext {
    value: ComputedRef<readonly string[]>;
    allValues: () => readonly string[];
    disabled: () => boolean;
    /** Checks or clears one child's value. */
    toggle: (value: string, checked: boolean) => void;
    /** The parent checkbox: checks every value of `allValues`, or none. */
    setAll: (checked: boolean) => void;
    /** A form reset: back to `defaultValue`. */
    reset: () => void;
    /** The children's element ids, for the parent's `aria-controls`. */
    ids: Ref<Readonly<Record<string, string>>>;
    /**
     * Inside a Field, the group is the field's control: its checkboxes take the field's `name`
     * and `disabled` from this binding, and do not register as the control themselves
     * (spec/checkbox.md). `null` outside a Field.
     */
    field: FieldControlBinding | null;
}

export const CheckboxGroupKey: InjectionKey<CheckboxGroupContext> =
    Symbol("CheckboxGroup");
