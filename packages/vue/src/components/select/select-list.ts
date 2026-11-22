import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { SelectKey } from "./select-context.ts";

export interface SelectListState {
    open: boolean;
}

/** The `listbox`, named by the trigger's labels (spec/select.md). */
export const SelectList: PartComponent<
    Record<never, never>,
    SelectListState
> = publicComponent(
    defineComponent({
        name: "SelectList",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(SelectKey, "Select.List");
            return () =>
                renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    { open: context.open.value },
                    {
                        role: "listbox",
                        id: context.listId,
                        "aria-labelledby": context.trigger.value?.id,
                        "data-primitives-part": "select-list",
                    },
                );
        },
    }),
);
