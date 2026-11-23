import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { EditableKey, type EditableState } from "./editable-context.ts";

/** Holds the Preview and the Input (spec/editable.md). */
export const EditableArea: PartComponent<
    Record<never, never>,
    EditableState
> = publicComponent(
    defineComponent({
        name: "EditableArea",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(EditableKey, "Editable.Area");
            return () =>
                renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    context.state.value,
                    {
                        "data-primitives-part": "editable-area",
                        ...context.attributes.value,
                    },
                );
        },
    }),
);
