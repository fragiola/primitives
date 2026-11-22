import type { FieldState } from "@fragiola/primitives/form";
import { fieldStateAttributes } from "@fragiola/primitives/form";
import { defineComponent, shallowRef, useId, watch } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { FieldKey } from "./field-context.ts";

export interface FieldDescriptionProps {
    id?: string;
}

/** Describes the field's control: listed in its `aria-describedby` (spec/field.md). */
export const FieldDescription: PartComponent<
    FieldDescriptionProps,
    FieldState
> = publicComponent(
    defineComponent({
        name: "FieldDescription",
        inheritAttrs: false,
        props: {
            ...asProp,
            id: { type: String, default: undefined },
        },
        setup(props, { attrs, slots }) {
            const field = useRequiredContext(FieldKey, "Field.Description");
            const generated = useId();
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = elementSetter(element);
            watch(
                element,
                (node, _, onCleanup) => {
                    if (node !== null) {
                        onCleanup(field.registerMessage(node));
                    }
                },
                { flush: "post" },
            );
            return () => {
                const state = field.state.value;
                return renderPart("p", { attrs, slots }, props.as, state, {
                    id: props.id ?? generated,
                    "data-primitives-part": "field-description",
                    ...stateAttributes(fieldStateAttributes(state)),
                    ref: setElement,
                });
            };
        },
    }),
);
