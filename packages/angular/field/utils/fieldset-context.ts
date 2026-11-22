import { InjectionToken, type Signal } from "@angular/core";

/**
 * What an enclosing `[fieldsetRoot]` gives the fields inside it (spec/fieldset.md): whether it is
 * disabled (its own `disabled`, or an ancestor Fieldset's). It lives in the field's entry, the
 * lower layer the Fieldset is built on, so a Field never imports the Fieldset.
 */
export interface FieldsetContext {
    disabled: Signal<boolean>;
}

export const FIELDSET_CONTEXT = new InjectionToken<FieldsetContext>(
    "FIELDSET_CONTEXT",
);
