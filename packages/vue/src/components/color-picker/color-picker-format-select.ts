import { defineComponent, onMounted, onUpdated, shallowRef } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    COLOR_PICKER_FORMATS,
    type ColorPickerFormat,
    ColorPickerKey,
    type ColorPickerState,
} from "./color-picker-context.ts";
import { colorPickerElement } from "./color-picker-element.ts";

export type ColorPickerFormatSelectProps = Record<never, never>;

/**
 * A native `select` of the picker's format (spec/color-picker.md, "The format"); its `option`s
 * and their text are the app's.
 */
export const ColorPickerFormatSelect: PartComponent<
    ColorPickerFormatSelectProps,
    ColorPickerState
> = publicComponent(
    defineComponent({
        name: "ColorPickerFormatSelect",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                ColorPickerKey,
                "ColorPicker.FormatSelect",
            );
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = colorPickerElement(element);
            // the selected option is the select's own state, set once mounted (a server marks
            // none); its default too, so a form reset shows the picker's format again (the format
            // is no form value)
            const show = () => {
                const select = element.value;
                if (!(select instanceof HTMLSelectElement)) {
                    return;
                }
                const { format } = context.state();
                for (const option of select.options) {
                    option.defaultSelected = option.value === format;
                }
                select.value = format;
            };
            onMounted(show);
            onUpdated(show);
            return () => {
                const current = context.state();
                // read here so a format change re-renders the select, which shows it again
                return renderPart(
                    "select",
                    { attrs, slots },
                    props.as,
                    current,
                    {
                        disabled: current.disabled,
                        "data-primitives-part": "color-picker-format-select",
                        ...stateAttributes({
                            format: current.format,
                            disabled: current.disabled,
                        }),
                        onChange: (event: Event) => {
                            const next = (
                                event.currentTarget as HTMLSelectElement
                            ).value as ColorPickerFormat;
                            if (COLOR_PICKER_FORMATS.includes(next)) {
                                context.setFormat(next, event);
                            }
                        },
                        ref: setElement,
                    },
                );
            };
        },
    }),
);
