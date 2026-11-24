import type { Align, Side } from "@fragiola/primitives/positioning";
import { defineComponent, inject, provide, ref } from "vue";
import {
    type OverlayRootEmits,
    type OverlayRootProps,
    overlayRootEmits,
    overlayRootProps,
    useOverlayRoot,
} from "../../composables/use-overlay-root.ts";
import { ColorPickerBindingKey } from "../../utils/color-picker-binding.ts";
import {
    type ContentSlots,
    type PublicComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { ColorPickerPopoverKey } from "./color-picker-popover-context.ts";

export interface ColorPickerPopoverRootProps extends OverlayRootProps {}

export type ColorPickerPopoverRootEmits = OverlayRootEmits;

/**
 * The open state of a ColorPicker's popup (`v-model:open`; spec/color-picker.md,
 * `/color-picker-popover`): placed inside a ColorPicker's Root, on Popover's overlay lifecycle.
 * Renders no element; a template ref on it exposes the actions, `close()` and `unmount()`.
 */
export const ColorPickerPopoverRoot: PublicComponent<
    ColorPickerPopoverRootProps,
    ContentSlots,
    ColorPickerPopoverRootEmits
> = publicComponent(
    defineComponent({
        name: "ColorPickerPopoverRoot",
        props: overlayRootProps,
        emits: overlayRootEmits,
        setup(props, { emit, slots, expose }) {
            const root = useOverlayRoot(props, emit);
            expose(root.actions);
            const picker = inject(ColorPickerBindingKey, null);
            provide(ColorPickerPopoverKey, {
                ...root,
                placed: ref<{ side: Side; align: Align }>({
                    side: "bottom",
                    align: "start",
                }),
                disabled: () => picker?.disabled() ?? false,
            });
            return () => slots.default?.();
        },
    }),
);
