import { openEyeDropper, supportsEyeDropper } from "@fragiola/primitives/color";
import { defineComponent, ref, watch } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    ColorPickerKey,
    type ColorPickerState,
} from "./color-picker-context.ts";

export type ColorPickerEyeDropperTriggerProps = Record<never, never>;

/**
 * Picks a color on screen with the browser's eyedropper (spec/color-picker.md,
 * "EyeDropperTrigger"); rendered only once mounted where `EyeDropper` exists.
 */
export const ColorPickerEyeDropperTrigger: PartComponent<
    ColorPickerEyeDropperTriggerProps,
    ColorPickerState
> = publicComponent(
    defineComponent({
        name: "ColorPickerEyeDropperTrigger",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                ColorPickerKey,
                "ColorPicker.EyeDropperTrigger",
            );
            // the API is the browser's: read once mounted, so the server render and hydration
            // match
            const supported = ref(false);
            watch(
                context.root,
                (root) => {
                    supported.value = root !== null && supportsEyeDropper(root);
                },
                { flush: "post", immediate: true },
            );
            return () => {
                if (!supported.value) {
                    return null;
                }
                const current = context.state();
                return renderPart(
                    "button",
                    { attrs, slots },
                    props.as,
                    current,
                    {
                        type: "button",
                        disabled: current.disabled,
                        "data-primitives-part":
                            "color-picker-eye-dropper-trigger",
                        ...stateAttributes({ disabled: current.disabled }),
                        onClick: (event: MouseEvent) => {
                            void openEyeDropper(
                                event.currentTarget as HTMLElement,
                            ).then((picked) => {
                                if (picked !== null) {
                                    context.pick(picked, event);
                                }
                            });
                        },
                    },
                );
            };
        },
    }),
);
