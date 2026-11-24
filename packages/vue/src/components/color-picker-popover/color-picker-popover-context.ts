import type { Align, Side } from "@fragiola/primitives/positioning";
import type { InjectionKey, Ref } from "vue";
import type { OverlayRoot } from "../../composables/use-overlay-root.ts";

export interface ColorPickerPopoverContext extends OverlayRoot {
    placed: Ref<{ side: Side; align: Align }>;
    /** The enclosing ColorPicker is disabled: the trigger opens nothing. */
    disabled: () => boolean;
}

export const ColorPickerPopoverKey: InjectionKey<ColorPickerPopoverContext> =
    Symbol("ColorPickerPopover");
