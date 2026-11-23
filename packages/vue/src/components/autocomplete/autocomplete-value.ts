import type { VNode } from "vue";
import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PublicComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { AutocompleteKey } from "./autocomplete-context.ts";

/** The default slot renders the value, the text (`v-slot="{ value }"`). */
export interface AutocompleteValueSlots {
    default?: (scope: { value: string }) => VNode[];
}

/** Renders the value: the text, or the default scoped slot of it. */
export const AutocompleteValue: PublicComponent<
    Record<never, never>,
    AutocompleteValueSlots
> = publicComponent(
    defineComponent({
        name: "AutocompleteValue",
        setup(_, { slots }) {
            const context = useRequiredContext(
                AutocompleteKey,
                "Autocomplete.Value",
            );
            return () =>
                slots.default?.({ value: context.value.value }) ??
                context.value.value;
        },
    }),
);
