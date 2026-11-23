import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { EditableKey, type EditableState } from "./editable-context.ts";

/** Starts an edit; `hidden` while editing (spec/editable.md). */
export const EditableEditTrigger: PartComponent<
    Record<never, never>,
    EditableState
> = publicComponent(
    defineComponent({
        name: "EditableEditTrigger",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                EditableKey,
                "Editable.EditTrigger",
            );
            return () => {
                const state = context.state.value;
                return renderPart("button", { attrs, slots }, props.as, state, {
                    type: "button",
                    hidden: state.editing || undefined,
                    disabled: state.disabled || state.readOnly,
                    "aria-controls": context.inputId(),
                    "data-primitives-part": "editable-edit-trigger",
                    ...context.attributes.value,
                    onClick: () => context.edit(),
                    ref: context.setEditTrigger,
                });
            };
        },
    }),
);
