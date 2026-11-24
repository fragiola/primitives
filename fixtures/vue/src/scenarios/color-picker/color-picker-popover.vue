<script setup lang="ts">
import { type Color, formatColor } from "@fragiola/primitives/color";
import type { OpenChangeDetails } from "@fragiola/primitives-vue/color-picker-popover";
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { ColorArea } from "../../kit/ui/color-area.ts";
import { ColorField } from "../../kit/ui/color-field.ts";
import { ColorPicker, ColorPickerPopover } from "../../kit/ui/color-picker.ts";
import { ColorSlider } from "../../kit/ui/color-slider.ts";
import { ColorSwatch } from "../../kit/ui/color-swatch.ts";

// spec/color-picker.md, `/color-picker/popover`: the picker in its opt-in popup.
const value = ref<string>();
const open = ref<boolean>();
const reason = ref<string>();
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
const onValueChange = (next: Color) => {
    value.value = formatColor(next, "hex");
};
const onOpenChange = (next: boolean, details: OpenChangeDetails) => {
    open.value = next;
    reason.value = details.reason;
};
</script>

<template>
    <form class="flex flex-col items-start gap-2" @submit="onSubmit">
        <ColorPicker.Root default-value="#336699" name="accent" @value-change="onValueChange">
            <ColorPickerPopover.Root @open-change="onOpenChange">
                <ColorPickerPopover.Trigger aria-label="Accent color">
                    <ColorSwatch />
                </ColorPickerPopover.Trigger>
                <ColorPickerPopover.Portal>
                    <ColorPickerPopover.Positioner :side-offset="8">
                        <ColorPickerPopover.Popup aria-label="Accent color picker">
                            <ColorArea.Root x-channel="saturation" y-channel="brightness" locale="en-US">
                                <ColorArea.Thumb>
                                    <ColorArea.Input axis="x" aria-label="Saturation" />
                                    <ColorArea.Input axis="y" aria-label="Brightness" />
                                </ColorArea.Thumb>
                            </ColorArea.Root>
                            <ColorSlider.Root channel="hue" locale="en-US">
                                <ColorSlider.Track>
                                    <ColorSlider.Thumb aria-label="Hue" />
                                </ColorSlider.Track>
                            </ColorSlider.Root>
                            <ColorField.Root>
                                <ColorField.Input aria-label="Hex" />
                            </ColorField.Root>
                        </ColorPickerPopover.Popup>
                    </ColorPickerPopover.Positioner>
                </ColorPickerPopover.Portal>
            </ColorPickerPopover.Root>
        </ColorPicker.Root>
        <div class="flex gap-2">
            <button type="button">After</button>
            <button type="submit">Submit</button>
        </div>
    </form>
    <Output :values="{ value, open, reason, form }" />
</template>
