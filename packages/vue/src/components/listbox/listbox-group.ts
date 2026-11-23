import { defineComponent, provide, ref } from "vue";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { ListboxGroupKey } from "./listbox-context.ts";

/** A `group` of items, named by its GroupLabel (spec/listbox.md). */
export const ListboxGroup: PartComponent<
    Record<never, never>,
    Record<never, never>
> = publicComponent(
    defineComponent({
        name: "ListboxGroup",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const labelId = ref<string>();
            provide(ListboxGroupKey, labelId);
            return () =>
                renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    {},
                    {
                        role: "group",
                        "aria-labelledby": labelId.value,
                        "data-primitives-part": "listbox-group",
                    },
                );
        },
    }),
);
