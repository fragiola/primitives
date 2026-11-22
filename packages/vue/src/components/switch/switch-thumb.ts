import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    SwitchKey,
    type SwitchState,
    switchAttributes,
} from "./switch-context.ts";

/** The moving part, always rendered; the recipe places it from `data-checked` (spec/switch.md). */
export const SwitchThumb: PartComponent<
    Record<never, never>,
    SwitchState
> = publicComponent(
    defineComponent({
        name: "SwitchThumb",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const state = useRequiredContext(SwitchKey, "Switch.Thumb");
            return () =>
                renderPart("span", { attrs, slots }, props.as, state.value, {
                    "data-primitives-part": "switch-thumb",
                    ...stateAttributes(switchAttributes(state.value)),
                });
        },
    }),
);
