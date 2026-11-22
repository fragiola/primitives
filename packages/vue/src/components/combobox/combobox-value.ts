import type { VNode } from "vue";
import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PublicComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { ComboboxKey } from "./combobox-context.ts";

/** The default slot renders the value: an item or `null`, or the list of items with `multiple`. */
export interface ComboboxValueSlots {
    default?: (scope: { value: unknown }) => VNode[];
}

/**
 * Renders the value: its label (labels joined with ", "), or the default scoped slot
 * (`v-slot="{ value }"`: an item or `null`, or the list of items).
 */
export const ComboboxValue: PublicComponent<
    Record<never, never>,
    ComboboxValueSlots
> = publicComponent(
    defineComponent({
        name: "ComboboxValue",
        setup(_, { slots }) {
            const context = useRequiredContext(ComboboxKey, "Combobox.Value");
            return () =>
                slots.default?.({ value: context.value.value }) ??
                context.values.value.map(context.label).join(", ");
        },
    }),
);
