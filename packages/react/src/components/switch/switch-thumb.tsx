import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    SwitchContext,
    type SwitchState,
    switchAttributes,
} from "./switch-context.ts";

export type SwitchThumbProps = PartProps<SwitchState>;

/** The moving part, always rendered; the recipe places it from `data-checked` (spec/switch.md). */
export function SwitchThumb(props: SwitchThumbProps) {
    const state = useRequiredContext(SwitchContext, "Switch.Thumb");
    return renderElement("span", props, state, {
        "data-primitives-part": "switch-thumb",
        ...stateAttributes(switchAttributes(state)),
    });
}
