import {
    labelFocusTarget,
    preventLabelSelection,
} from "@fragiola/primitives/form";
import { defineComponent } from "vue";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";

/** A Label has no state of its own (spec/label.md). */
export type LabelState = Record<string, never>;

/** The native `for` attribute names its control; without it, the labelable control it wraps. */
export type LabelProps = Record<never, never>;

const STATE: LabelState = {};

/**
 * A `<label>` (spec/label.md): it names its control by `for` or by wrapping it, a press reaches
 * the control (or focuses the element `for` names when that is no labelable one), and a double
 * press selects none of its text.
 */
export const Label: PartComponent<LabelProps, LabelState> = publicComponent(
    defineComponent({
        name: "LabelRoot",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            return () =>
                renderPart("label", { attrs, slots }, props.as, STATE, {
                    onMousedown: (event: MouseEvent) => {
                        preventLabelSelection(event);
                    },
                    onClick: (event: MouseEvent) => {
                        if (event.defaultPrevented) {
                            return;
                        }
                        const label = event.currentTarget;
                        if (label instanceof HTMLLabelElement) {
                            labelFocusTarget(label)?.focus();
                        }
                    },
                    "data-primitives-part": "label-root",
                });
        },
    }),
);
