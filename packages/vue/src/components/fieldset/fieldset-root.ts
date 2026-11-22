import { defineComponent, inject, provide, ref } from "vue";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { FieldsetKey } from "../field/fieldset-context.ts";

export interface FieldsetState {
    disabled: boolean;
}

export interface FieldsetRootProps {
    /** Disables the native fieldset and every Field inside it. */
    disabled?: boolean;
}

/**
 * A native `fieldset`, named by its Legend; disables the fields inside it, and inherits an
 * enclosing Fieldset's `disabled` (spec/fieldset.md).
 */
export const FieldsetRoot: PartComponent<FieldsetRootProps, FieldsetState> =
    publicComponent(
        defineComponent({
            name: "FieldsetRoot",
            inheritAttrs: false,
            props: {
                ...asProp,
                /** Disables the native fieldset and every Field inside it. */
                disabled: { type: Boolean, default: false },
            },
            setup(props, { attrs, slots }) {
                const parent = inject(FieldsetKey, null);
                const disabled = () =>
                    props.disabled || (parent?.disabled() ?? false);
                const legendId = ref<string>();
                provide(FieldsetKey, { disabled, legendId });
                return () => {
                    const state = { disabled: disabled() };
                    return renderPart(
                        "fieldset",
                        { attrs, slots },
                        props.as,
                        state,
                        {
                            "aria-labelledby": legendId.value,
                            disabled: state.disabled,
                            "data-primitives-part": "fieldset-root",
                            ...stateAttributes(state),
                        },
                    );
                };
            },
        }),
    );
