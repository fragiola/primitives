import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { EditableKey, type EditableState } from "./editable-context.ts";

/** Commits the edit; `hidden` until one starts (spec/editable.md). */
export const EditableSubmitTrigger: PartComponent<
    Record<never, never>,
    EditableState
> = publicComponent(
    defineComponent({
        name: "EditableSubmitTrigger",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                EditableKey,
                "Editable.SubmitTrigger",
            );
            return () => {
                const state = context.state.value;
                return renderPart("button", { attrs, slots }, props.as, state, {
                    type: "button",
                    hidden: !state.editing || undefined,
                    disabled: state.disabled,
                    "data-primitives-part": "editable-submit-trigger",
                    ...context.attributes.value,
                    onClick: (event: MouseEvent) =>
                        context.commit("submit-press", event),
                    ref: context.setSubmitTrigger,
                });
            };
        },
    }),
);
