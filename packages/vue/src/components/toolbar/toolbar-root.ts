import type { RovingOrientation } from "@fragiola/primitives/collection";
import { defineComponent, type PropType, provide } from "vue";
import { useRovingComposite } from "../../composables/use-roving-composite.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { RovingKey } from "../../utils/roving-context.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { ToolbarKey } from "./toolbar-context.ts";

export interface ToolbarRootState {
    orientation: RovingOrientation;
    disabled: boolean;
}

export interface ToolbarRootProps {
    /** The arrow keys' axis (default `"horizontal"`). */
    orientation?: RovingOrientation;
    /** The arrows wrap from the last item to the first and back (default `true`). */
    loopFocus?: boolean;
    /** Every Button, Input, Toggle and ToggleGroup in it is disabled. */
    disabled?: boolean;
}

/**
 * A set of controls that is one tab stop (spec/toolbar.md, the APG toolbar): the roving-focus
 * scope every item inside registers with, a ToggleGroup's Toggles included ("Nested composites").
 */
export const ToolbarRoot: PartComponent<ToolbarRootProps, ToolbarRootState> =
    publicComponent(
        defineComponent({
            name: "ToolbarRoot",
            inheritAttrs: false,
            props: {
                ...asProp,
                orientation: {
                    type: String as PropType<RovingOrientation>,
                    default: "horizontal",
                },
                loopFocus: { type: Boolean, default: true },
                disabled: { type: Boolean, default: false },
            },
            setup(props, { attrs, slots }) {
                const { scope, onKeydown, ref } = useRovingComposite({
                    orientation: () => props.orientation,
                    loopFocus: () => props.loopFocus,
                    disabled: () => props.disabled,
                });
                provide(RovingKey, scope);
                provide(ToolbarKey, { orientation: () => props.orientation });
                return () => {
                    const { orientation, disabled } = props;
                    return renderPart(
                        "div",
                        { attrs, slots },
                        props.as,
                        { orientation, disabled },
                        {
                            role: "toolbar",
                            "aria-orientation": orientation,
                            "data-primitives-part": "toolbar-root",
                            ...stateAttributes({ orientation, disabled }),
                            onKeydown,
                            ref,
                        },
                    );
                };
            },
        }),
    );
