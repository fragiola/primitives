import { defineComponent, provide, ref } from "vue";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { SelectGroupKey } from "./select-context.ts";

/** A `group` of items, named by its GroupLabel (spec/select.md). */
export const SelectGroup: PartComponent<
    Record<never, never>,
    Record<never, never>
> = publicComponent(
    defineComponent({
        name: "SelectGroup",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const labelId = ref<string>();
            provide(SelectGroupKey, labelId);
            return () =>
                renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    {},
                    {
                        role: "group",
                        "aria-labelledby": labelId.value,
                        "data-primitives-part": "select-group",
                    },
                );
        },
    }),
);
