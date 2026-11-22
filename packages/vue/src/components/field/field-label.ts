import type { FieldState } from "@fragiola/primitives/form";
import { fieldStateAttributes } from "@fragiola/primitives/form";
import { defineComponent, onBeforeUnmount, useId, watch } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { FieldKey } from "./field-context.ts";

export interface FieldLabelProps {
    id?: string;
}

/** Names the field's control: `for` a labelable control, `aria-labelledby` on any (spec/field.md). */
export const FieldLabel: PartComponent<FieldLabelProps, FieldState> =
    publicComponent(
        defineComponent({
            name: "FieldLabel",
            inheritAttrs: false,
            props: {
                ...asProp,
                id: { type: String, default: undefined },
            },
            setup(props, { attrs, slots }) {
                const field = useRequiredContext(FieldKey, "Field.Label");
                const generated = useId();
                const id = () => props.id ?? generated;
                // cleared on unmount, not in the watch's cleanup: a server render stops the watch
                // once the label is rendered, before the control reads the id (Epic #22)
                watch(id, (current) => (field.labelId.value = current), {
                    immediate: true,
                });
                onBeforeUnmount(() => {
                    if (field.labelId.value === id()) {
                        field.labelId.value = undefined;
                    }
                });
                const onClick = (event: MouseEvent) => {
                    const control = field.control.value;
                    if (control === null || !control.labelFocuses) {
                        return;
                    }
                    // no activation of the control: focus only
                    event.preventDefault();
                    const label = event.currentTarget as HTMLElement;
                    label.ownerDocument.getElementById(control.id)?.focus();
                };
                return () => {
                    const state = field.state.value;
                    const control = field.control.value;
                    return renderPart(
                        "label",
                        { attrs, slots },
                        props.as,
                        state,
                        {
                            id: id(),
                            for: control?.labelable ? control.id : undefined,
                            "data-primitives-part": "field-label",
                            ...stateAttributes(fieldStateAttributes(state)),
                            onClick,
                        },
                    );
                };
            },
        }),
    );
