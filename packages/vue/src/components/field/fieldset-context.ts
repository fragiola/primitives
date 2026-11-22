import type { InjectionKey, Ref } from "vue";

/**
 * What a Fieldset gives the fields inside it (spec/fieldset.md). It lives with the Field, which
 * reads it: Fieldset is built on Field, never the other way round.
 */
export interface FieldsetContext {
    /** Disabled by its own `disabled`, or by an enclosing Fieldset's. */
    disabled: () => boolean;
    /** The rendered Legend's id, which names the Root. */
    legendId: Ref<string | undefined>;
}

export const FieldsetKey: InjectionKey<FieldsetContext> = Symbol("Fieldset");
